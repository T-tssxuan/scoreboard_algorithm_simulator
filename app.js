$(document).ready(function () {
    var uiFetchedInstructions = [];
    // Pre instructions
    var source = "LD F6 34 R2\r\nLD F2 45 R3\r\nMULT F0 F2 F4\r\n";
    source += "SUBD F8 F6 F2\r\nDIVD F10 F0 F6\r\nADDD F6 F8 F2";
    $("#new_instructions").val(source);

    // New simulator controller
    var controller = new Controller([]);
    var timeID = 0;
    uiRunSimulate();

    $("#continue").click(function() {
        window.clearTimeout(timeID);
        timeID = window.setTimeout(uiRunSimulate, 2000);
    });

    $("#pause").click(function() {
        window.clearTimeout(timeID);
    });
    
    $("#load").click(function () {
        // Load the new instructions
        var new_instructions = $("#new_instructions").val().split("\n");
        try {
            new_instructions.forEach(function (instruction) {
                if (instruction == "") {
                    return;
                }
                var elements = instruction.split(" ");
                if (elements.length != 4) {
                    throw BreakException;
                }
                if (controller.isInInstructionSet(elements[0])) {
                    controller.addInstruction(new Instruction(elements[0], 
                                elements[1], elements[2], elements[3]));
                } else {
                    throw BreakException;
                }
            });
            $("#new_instructions").val("");
            var all_instructions = controller.getNotExecInctruction().map(
                    function (obj) {
                        return '<div style="border: 1px solid">' + obj.getSource() + "</div>";
                    }
            );
            var str = all_instructions.join("");
            $("#all_instructions").html(str);
            window.clearTimeout(timeID);
            timeID = window.setTimeout(uiRunSimulate, 2000);
        } catch(e) {
            alert("error instruction");
        }
    });


    // Forward the simulator and update the UI
    function uiRunSimulate() {
        if (controller.forward() ) {
            timeID = window.setTimeout(uiRunSimulate, 2000);
        }
        uiUpdateInstructions(controller);

        uiUpdtateFunctionUnit(controller);

        uiUpdateRegister(controller);

        var all_instructions = controller.getNotExecInctruction().map(
                function (obj) {
                    return '<div style="border: 1px solid">' + obj.getSource() + "</div>";
                }
                );
        var str = all_instructions.join("");
        $("#all_instructions").html(str);
    }

    // Update the function unit UI
    function uiUpdtateFunctionUnit(simulator) {
        for (var key in simulator.functionUnitSet) {
            var unit = simulator.functionUnitSet[key];
            var row = $("#function_unit").find("#" + key);
            if (row.length == 0) {
                $("#function_unit").append(uiMakeUnitRow(unit));
            } else {
                uiSetUnitStage(row, unit.exec);
                for (var element in unit) {
                    var temp = row.find("." + element);
                    if (temp.length != 0) {
                        if (temp.html() != unit[element] + "") {
                            temp.html(unit[element] + "");
                        }
                    }
                }
            }
        }
    }

    function uiMakeUnitRow (unit) {
        var temp = '<tr id="' + unit.name + '">';
        temp += '<td class="name">' + unit.name + "</td>";
        temp += '<td class="busy">' + unit.busy + "</td>";
        temp += '<td class="Op">' + unit.Op + "</td>";
        temp += '<td class="Fi">' + unit.Fi + "</td>";
        temp += '<td class="Fj">' + unit.Fj + "</td>";
        temp += '<td class="Fk">' + unit.Fk + "</td>";
        temp += '<td class="Qj">' + unit.Qj + "</td>";
        temp += '<td class="Qk">' + unit.Qk + "</td>";
        temp += '<td class="Rj">' + unit.Rj + "</td>";
        temp += '<td class="Rk">' + unit.Rk + "</td>";
        temp += "</tr>";
        return temp;
    }

    function uiSetUnitStage (row, exec) {
        switch (exec) {
            case 0:
                row.css("background-color", "#FFFFFF");
                break;
            case 1:
                row.css("background-color", "#449D44");
                break;
            case 2:
                row.css("background-color", "#31B0D5");
                break;
            case 3:
                row.css("background-color", "#EC971F");
                break;
            case 4:
                row.css("background-color", "#D9534F");
                break;
        }
    }

    // Update the register UI
    function uiUpdateRegister(simulator) {
        for (var key in simulator.registers) {
            var row = $("#" + key);
            if (row.html() != simulator.registers[key].manipulation) {
                row.html(simulator.registers[key].manipulation);
            }
        }
    }

    // Update the Instructions UI
    function uiUpdateInstructions(simulator) {
        var rows = $("#instruction_table").find("tr");
        for (var i = 0; i < simulator.fetched.length; i ++) {
            var instruction = simulator.fetched[i];
            if (i >= rows.length) {
                var temp = "<tr>";
                temp += "<td>" + instruction.getSource() + "</td>";
                for (var j = 0; j < instruction.stage.length; j ++) {
                    temp += "<td>" + instruction.stage[j] + "</td>";
                }
                temp += "</tr>";
                $("#instruction_table").append(temp);
            } else {
                var cols = $(rows[i]).find("td");
                $(cols[0]).html(instruction.getSource());
                for (var j = 0; j < instruction.stage.length; j ++) {
                    $(cols[j + 1]).html(instruction.stage[j]);
                }
            }
        }
    }
});

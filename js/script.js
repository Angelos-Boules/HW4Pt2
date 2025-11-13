/*  Name: Angelos Boules
    File: script.js
    Date: 11/1/2025
    
    Purpose: GUI Assignment: Functionality of the Dynamic Multiplication webpage - 
    This file is responsible for implementing the table generation as well as validating
    the user inputs form the html form. Injects html for the table based on the desired user data,
    and uses helper functions for modularity. Uses jQuery for validation and jQuery UI for sliders
    and tabs
    
    Angelos Boules, UMass Lowell Computer Science, angelos_boules@student.uml.edu
    Copyright (c) 2025 by Angelos. All rights reserved. May be freely copied or
    excerpted for educational purposes with credit to the author.
    updated by AB on November 1, 2025 at 5:05 PM
*/
$(document).ready(function () {

    // Custom column method to make sure min is less than max
    $.validator.addMethod('colBoundaryCheck', function (value, element) {
        const minCol = parseInt($('#minCol').val());
        const maxCol = parseInt($('#maxCol').val());
        return isNaN(minCol) || isNaN(maxCol) || minCol <= maxCol;
    }, 'Minimum column value cannot be greater than maximum column value');

    // Custom row method to make sure min is less than max
    $.validator.addMethod('rowBoundaryCheck', function (value, element) {
        const minRow = parseInt($('#minRow').val());
        const maxRow = parseInt($('#maxRow').val());
        return isNaN(minRow) || isNaN(maxRow) || minRow <= maxRow;
    }, 'Minimum row value cannot be greater than maximum row value');

    // Custom method to santize decimal inputs
    $.validator.addMethod('integerFloorRangeCheck', function (value, element, params) {
        if (value === '') return true;

        const num = parseFloat(value);
        if (isNaN(num)) return false;
        
        const truncated = Math.trunc(num);

        // If not decimal, set the value to the floor 
        if (!Number.isInteger(num)) {
            $(element).val(truncated);
        }

        return truncated >= params[0] && truncated <= params[1];
    }, 'Value is out of range');

    // Validation configurations
    $('#settings').validate({
        rules: {
            minCol: {
                required: true,
                number: true,
                integerFloorRangeCheck: [-50, 50],
                colBoundaryCheck: true
            },
            maxCol: {
                required: true,
                number: true,
                integerFloorRangeCheck: [-50, 50],
                colBoundaryCheck: true
            },
            minRow: {
                required: true,
                number: true,
                integerFloorRangeCheck: [-50, 50],
                rowBoundaryCheck: true
            },
            maxRow: {
                required: true,
                number: true,
                integerFloorRangeCheck: [-50, 50],
                rowBoundaryCheck: true
            }
        },
        messages: {
            minCol: {
                required: 'Please enter a value for minimum column',
                number: 'Invalid character. Must be a number between -50 and 50 inclusive',
                integerFloorRangeCheck: 'Value must be between -50 and 50 inclusive',
                colBoundaryCheck: 'Minimum column cannot be greater than maximum column. Make sure this value is less than the value in Maximum Column'
            },
            maxCol: {
                required: 'Please enter a value for maximum column',
                number: 'Invalid characters. Must be a number between -50 and 50 inclusive',
                integerFloorRangeCheck: 'Value must be between -50 and 50 inclusive',
                colBoundaryCheck: 'Maximum column cannot be less than minimum column. Make sure this value is more than the value in Minimum Column'
            },
            minRow: {
                required: 'Please enter a value for minimum row',
                number: 'Invalid character. Must be a number between -50 and 50 inclusive',
                integerFloorRangeCheck: 'Value must be between -50 and 50 inclusive',
                rowBoundaryCheck: 'Minimum row cannot be greater than maximum row. Make sure this value is less than the value in Maximum Row'
            },
            maxRow: {
                required: 'Please enter a value for maximum row',
                number: 'Invalid characters. Must be a number between -50 and 50 inclusive',
                integerFloorRangeCheck: 'Value must be between -50 and 50 inclusive',
                rowBoundaryCheck: 'Maximum row cannot be less than minimum row. Make sure this value is less than the value in Minimum Row'
            },
        },
        // Ensures that errors are below the input and styled appropriately
        errorPlacement: function(error, element) {
            error.addClass('note text-danger px-4 w-100 d-inline-block');
            error.insertAfter(element.closest('.form-row'));
        },
        // Removes label area that is created in case of success
        success: function(label) {
            label.remove();
        },
    });

    // ---  Sliders Setup --- \\
    const inputIds = ['minCol', 'maxCol', 'minRow', 'maxRow'];
    
    // Configure slider
    const sliderConfig = {
    range: 'min',
    min: -50,
    max: 50,
    step: 1,
    // Assign the slider value to the input box
    slide: function(event, ui) {
        $('#' + this.id.replace('-slider', '')).val(ui.value);
    },
    // Validate the slider value using the jQuery validation rules
    change: function(event, ui) {
        $('#' + this.id.replace('-slider', '')).valid();
    }
    }

    // Attach the slider configuration to every input field in the array above
    for (let i = 0; i < inputIds.length; i++) {
        const id = inputIds[i];
        const currSlider = $('#' + id + '-slider'); // get id of correct slider form the input field id
        currSlider.slider ({
            ...sliderConfig,
            value: parseInt($('#' + id).val()) || 0
        });

        const currInputId = $('#' + id); // get input field
        currInputId.on('input', function() {
            const value = parseInt(this.value);
            // Assign slider the value of input field if it falls in range and is a number
            if (!isNaN(value) && value >= -50 && value <= 50) {
                currSlider.slider('value', value);
            } else {
                // If error'ed reset to 0
                currSlider.slider('value', 0);
            }
        });
    }

    // --- Tabs Setup --- \\
    // Initializing tabs
    const $tabs = $('#tabs').tabs(); 
    let tabCounter = 0;

    function addTab(minC, maxC, minR, maxR) {
        tabCounter++;
        const tabID = 'table-tab-' + tabCounter; // naming scheme: table-tab-1/2/3...
        const label = `(${minC} to ${maxC}) by (${minR} to ${maxR})`; // e.g. (3 to 10) by (4 to 10)

        const li = $(`
            <li>
                <a href="#${tabID}">${label}</a>
                <span class="ui-icon ui-icon-close"></span>
            </li>    
        `);
        const tabDiv = $(`<div id="${tabID}"></div>`);
        $tabs.find('.ui-tabs-nav').append(li);
        $('#tabs').append(tabDiv);
        $tabs.tabs('refresh');
        $tabs.tabs('option', 'active', -1);

        generateTable(minC, maxC, minR, maxR, tabID);
        updateDeleteList();
    }

    // On clicking the ui close icon, remove the tab (ul) and associated div
    $tabs.on('click', 'span.ui-icon-close', function() {
        const tabItem = $(this).closest('li');
        const divItem = tabItem.find('a').attr('href');
        tabItem.remove();
        $(divItem).remove();
        $tabs.tabs('refresh'); // ensure jQuery UI is updated
        updateDeleteList();
    });

    // --- Tab Delete Controls --- \\
    // Iterate through tabs (not including first one) and display them in delete list as an option
    function updateDeleteList() {
        const $list = $('#delete-list');
        $list.empty();
        $('#tabs ul li a').each(function() {
            const label = $(this).text();
            const href = $(this).attr('href');
            const id = href.slice(1);
            $list.append(`
                <div class='form-check'>
                    <input class='form-check-input' type='checkbox' value='${href}' id='chk-${id}'>
                    <label class='form-check-label' for='chk-${id}'> ${label}</label>
                </div>
            `);
        });
    }

    // Delete the selected items
    $('#delete-selected').click(() => {
        $('#delete-list input:checked').each(function() {
            const id = $(this).val();
            // Removing the tab
            $(`#tabs ul li a[href="${id}"]`).parent().remove();
            // Removing the div
            $(id).remove();
        });
        $tabs.tabs('refresh');
        updateDeleteList();
    });

    // Delete all button
    $('#delete-all').click(() => {
        $('#tabs ul li').remove();
        $('[id^="table-tab"]').remove(); // Remove all div's with id's starting with 'table-tab'
        $tabs.tabs('refresh');
        updateDeleteList();
    });

    // --- Auto table generation ---\\
    // Function to update table after validating with buffer time
    let timer;
    function updateValidTable() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if ($('#settings').valid()) {
                const minCol = parseInt($('#minCol').val());
                const maxCol = parseInt($('#maxCol').val());
                const minRow = parseInt($('#minRow').val());
                const maxRow = parseInt($('#maxRow').val());
                addTab(minCol, maxCol, minRow, maxRow);
            }
        }, 300);
    }

    // Trigger inputs and silders on changed values
    $('#minCol, #maxCol, #minRow, #maxRow').on('input', updateValidTable);
    $('#minCol-slider, #maxCol-slider, #minRow-slider, #maxRow-slider')
        .on('slidestop', updateValidTable);
});

/**
 * Generates the table elements in the DOM
 */
function generateTable(minCol, maxCol, minRow, maxRow, id) {
    const container = document.getElementById(id);
    container.classList.add('table-wrapper');
    container.innerHTML = '';

    // Create header row + append it to table
    const table = document.createElement('table');
    table.classList.add('mult-table');
    const tableHead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    for (let i = minCol - 1; i <= maxCol; i++) {
        const cell = document.createElement('td');
        const cellText = document.createTextNode(i);

        cell.appendChild(cellText);
        headerRow.appendChild(cell);
    }
    tableHead.appendChild(headerRow);
    table.appendChild(tableHead);

    // Create rest of the body + append to table
    const tableBody = document.createElement('tbody');
    for (let r = minRow; r <= maxRow; r++) {
        const row = document.createElement('tr');

        for (let c = minCol - 1; c <= maxCol; c++) {
            const cell = document.createElement('td');
            let text;
            if (c === minCol - 1) {
                text = r;
            } else {
                text = r * c;
            }
            const cellText = document.createTextNode(text);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }

        tableBody.appendChild(row);
    }

    table.appendChild(tableBody);
    container.append(table);
}
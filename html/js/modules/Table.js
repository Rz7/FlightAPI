class Table {
    constructor(parentBlock) {
        this.parentBlock = parentBlock;
        this.init();
    }

    init() {
        this.template = () => `
           <div class="tab-content"></div>
        `;

        this.table_template = ({ date, active, pid }) => `
            <div class="tab-pane ${active}" id="${pid}-d${date}" role="tabpanel">
                <table class="table">
                    <tr>
                        <th>Flight</th>
                        <th>Plane</th>
                        <th>Locations</th>
                        <th>Date (Note: all times are local)</th>
                        <th>Duration</th>
                        <th>Price</th>
                    </tr>
                </table>
                <div class="loader">
                    <div style="margin: 10px auto; width: 50px;">
                        <i class="fa fa-circle-o-notch fa-spin" style="font-size:50px"></i>
                    </div>
                </div>
            </div>
        `;

        this.row_template = ({ flightNum, plane, start, finish, durationMin, price }) => `
            <tr>
                <td>№${flightNum}</td>
                <td>${plane['shortName']}</td>
                <td>
                    <p>From: ${start['cityName']}(${start['airportCode']})</p>
                    <p>To: ${finish['cityName']}(${finish['airportCode']})</p>
                </td>
                <td>
                    <p>Departure: ${moment(start['dateTime']).format('Do MMM YYYY [at] HH:mm')}</p>
                    <p>Arrival: ${moment(finish['dateTime']).format('Do MMM YYYY [at] HH:mm')}</p>
                </td>
                <td>${moment.duration(durationMin, 'minutes').format('HH[h] mm[m]')}</td>
                <td>$${price}</td>
            </tr>
        `;
    }

    set(tabs) {
        this.parentBlock.append(this.template());
        this.tabContent = this.parentBlock.find('.tab-content');

        // Set tables
        appendTemp(this.table_template, this.tabContent, tabs);
    }

    setResult(paneId, body) {

        // Remove loader
        $(paneId).find('.loader').remove();

        let tBody = $(paneId).find('tbody');
        appendTemp(this.row_template, tBody, body);
    }

    setErrorResult(paneId, errMessage) {
        $(paneId).find('.loader').html(`<h5>${errMessage}</h5>`);
    }
}
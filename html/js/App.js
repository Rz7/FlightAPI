// Some settings
var sett = {
    'm-format': 'YYYY-MM-DD',
    'p-format': 'YYYY-MM-DD',
    'url': '127.0.0.1',
    'protocol': 'http',
    'search': '/search',
    'port': 3000,

    'msg': {
        'error': 'An error occurred',
        'no_results': 'No results found for this date'
    }
};

function setTemp(temp, self, array) {
    return self.html(array.map(temp).join(''));
}

function appendTemp(temp, self, array) {
    return self.append(array.map(temp).join(''));
}

$(function () {

    let alerts = new Alerts();

    function install(containerId) {

        // Get current container block
        let c = $(`#${containerId}`);

        // Init elements //
        let search = new Search(c);
        let options = new Options(c);
        let table = new Table(c);

        // Set elements //
        search.set();
        c.find('#datetimepicker1').datetimepicker({ format: sett['p-format'] });

        new Button(c, function(err, command, data) {

            switch(err)
            {
                case 'validation_err':
                    return alerts.warning('Not all fields are correct');
                case 'load_data_error':
                    alerts.danger(data.err_msg);
                    return table.setErrorResult(`#${containerId}-d${data.day}`, data.err_msg);
            }

            switch(command)
            {
                case 'load_options':
                    search.cleanup();
                    options.set(data.days);
                    break;
                case 'load_tables':
                    table.set(data.tabs);
                    break;
                case 'load_day':
                    table.setResult(`#${containerId}-d${data.day}`, data.body);
                    break;
            }
        });
    }

    // Or more
    install('container-1');
    install('container-2');
});
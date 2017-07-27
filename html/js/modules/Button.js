class Button {
    constructor(parentBlock, handler) {
        this.parent = parentBlock;
        this.handler = handler;

        this.me = this.parent.find('#load');

        this.events();
    }

    events() {
        this.me.on('click', this.onClick.bind(this));
    }

    onClick() {

        let date    = this.parent.find('#date').val();
        let to      = this.parent.find('#loc-to').val();
        let from    = this.parent.find('#loc-from').val();

        if( ! from || ! to || ! date) {
            this.handler('validation_err');
            return false;
        }

        // Block the button
        this.me.button('loading');

        // Range of 5 days
        let days = {
            't1':  moment(date, sett['m-format']).subtract(2, 'day'),
            't2':  moment(date, sett['m-format']).subtract(1, 'day'),
            't3':  moment(date, sett['m-format']),
            't4':  moment(date, sett['m-format']).add(1, 'day'),
            't5':  moment(date, sett['m-format']).add(2, 'day')
        };

        // Tabs
        let tabs = [];

        // Get right format
        for(let i in days) {
            days[i] = days[i].format(sett['m-format']);
            tabs.push({ date: days[i], active: i === 't3' ? ' active' : "", pid: this.parent.attr('id') });
        }

        // To load options
        this.handler(null, 'load_options', { days: days });


        // To load tables
        this.handler(null, 'load_tables', { tabs: tabs });

        // To load data
        new DataLoader(
            from, to, days, ['t3','t2','t4','t1','t5'],
            (err, data) => {
                this.handler(err, 'load_day', data);
            }
        ).process().then(() => {
            this.me.button('reset');
        });

        return false;
    }
}
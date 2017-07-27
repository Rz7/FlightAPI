class DataLoader {
    constructor(from, to, days, queue, callback) {
        this.from = from;
        this.to = to;
        this.days = days;
        this.queue = queue;
        this.counter = 0;
        this.callback = callback;
        return this;
    }

    ajax(from, to, date) {
        let params = encodeURI("/?date="+date+"&from="+from+"&to="+to);
        return $.ajax({url: sett['protocol']+"://"+sett['url']+":"+sett['port']+sett['search']+params});
    }

    process () {
        let self = this;
        let day = this.days[this.queue[this.counter]];

        return new Promise((res) => {
            this.ajax(this.from, this.to, day).done((data) => {
                if (data['success'] === true)
                {
                    let body = data['body'];

                    if ( ! body || body.length === 0)
                        body = `<h5>${sett['msg']['no_results']}</h5>`;

                    self.callback(null, { day: day, body: body });
                    res(true);
                }
                else
                    res(false);
            }).fail(() => {
                res(false);
            });
        }).then((result) => {

            if(result === false)
                self.callback('load_data_error', { day: day, err_msg: sett['msg']['error'] });

            if (++this.counter >= this.queue.length)
                return true;

            return this.process();
        });
    }
}
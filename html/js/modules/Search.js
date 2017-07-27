class Search {
    constructor(parentBlock) {
        this.parentBlock = parentBlock;
        this.today = moment().format(sett['m-format']);

        this.init();
    }

    init() {
        this.template = () => `
            <div class="row">
                <div class='col-sm-12'>
                    <h1>Search for flights</h1>
                </div>
            </div>
            <div id="search" class="row">
                <div class='col-sm-3'>
                    <input id="loc-from" type="text" class="form-control" placeholder="From">
                </div>
                <div class='col-sm-3'>
                    <input id="loc-to" type="text" class="form-control" placeholder="To">
                </div>
                <div class='col-sm-3'>
                    <div class="form-group">
                        <div class='input-group date' id='datetimepicker1'>
                            <input id="date" type='text' class="form-control" value="${this.today}" />
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-calendar"></span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class='col-sm-3'>
                    <button
                        type="button"
                        class="btn btn-primary"
                        id="load"
                        data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i> Searching">
                    Search
                    </button>
                </div>
            </div>
        `;
    }

    set() {
        this.parentBlock.html(this.template());
    }

    cleanup() {
        this.parentBlock.find('#search').nextAll().remove();
    }
}
class Options {
    constructor(parentBlock) {
        this.parentBlock = parentBlock;

        this.init();
    }

    init() {
        this.template = ({ days, pid }) => `
            <div class="row">
                <div id="options" class="row" style="display: block;">
                    <div class='col-sm-3' style="top: 10px;">Check other days for more suitable flights:</div>
                    <ul class="nav nav-tabs">
                        <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#${pid}-d${days['t1']}" role="tab">${days['t1']}</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#${pid}-d${days['t2']}" role="tab">${days['t2']}</a>
                        </li>
                        <li class="nav-item active">
                            <a class="nav-link" data-toggle="tab" href="#${pid}-d${days['t3']}" role="tab">${days['t3']}</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#${pid}-d${days['t4']}" role="tab">${days['t4']}</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#${pid}-d${days['t5']}" role="tab">${days['t5']}</a>
                        </li>
                    </ul>
                    <div class='col-sm-3'></div>
                </div>
            </div>
        `;
    }

    set(days) {
        this.parentBlock.append(this.template({ days: days, pid: this.parentBlock.attr('id') }));
    }
}
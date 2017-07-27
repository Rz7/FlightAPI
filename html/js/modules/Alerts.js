class Alerts {
    constructor() {
        this.init();
    }

    init() {
        this.template = ({type, title, msg}) => `
            <div class="alert alert-${type}" role="alert">
                <strong>${title}</strong> ${msg}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
    }

    warning(msg) {
        $('#alerts').html(this.template({
            type: 'warning', title: 'Warning!', msg: msg
        }));
    }

    danger(msg) {
        $('#alerts').html(this.template({
            type: 'danger', title: 'Oh snap!', msg: msg
        }));
    }
}
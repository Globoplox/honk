const Collapse = (function () {
    function initialize_collapsible(root) {
        const header = root.querySelector(".collapsible-header");
        const body = root.querySelector(".collapsible-body");
        header.onclick = _ => {
            root.classList.toggle("collapsed");
        };
    }
    
    function init() {
        const elements = document.querySelectorAll(".collapsible li");
        for (let i = 0; i < elements.length; i++) {
            elements[i].querySelector(".collapsible-header").onclick = _ => {
                elements[i].classList.toggle("collapsed");
            }
        }
    }
    
    function collapse(element) {
        element.classList.add("collapsed")
    }

    function expend(element) {
        element.classList.remove("collapsed")
    }

    function toggle(element) {
        element.classList.toggle("collapsed")
    }

    return {init, collapse, expend, toggle};
})();


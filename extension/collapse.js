const Collapse = (function () {
    
    function init() {
        const elements = document.querySelectorAll(".collapsible li");
        for (let i = 0; i < elements.length; i++) {
            const buttons = elements[i].querySelector(".collapse-button");
            if (buttons)
                buttons.onclick = _ => { elements[i].classList.toggle("collapsed"); }
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
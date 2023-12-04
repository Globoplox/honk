const Collapse = (function () {
    
    function init() {
        console.log("HEY INIT COLLAPSIBLE")
        const elements = document.querySelectorAll(".collapsible li");
        console.log(elements)
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
        console.log(element);
        element.classList.remove("collapsed")
    }

    function toggle(element) {
        element.classList.toggle("collapsed")
    }

    return {init, collapse, expend, toggle};
})();
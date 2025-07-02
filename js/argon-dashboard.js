/*!

=========================================================
* Argon Dashboard 2 Tailwind - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-tailwind
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

* Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Inicialização do tema Argon Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes do tema
    initSidebar();
    initDropdowns();
    initTooltips();
    initRipple();
    initPerfectScrollbar();
    initNavbarFixed();
});

// Função para inicializar a barra lateral
function initSidebar() {
    const sidenavToggler = document.querySelectorAll("[sidenav-trigger]");
    const sidenav = document.querySelector("[sidenav]");
    const overlay = document.querySelector("[sidenav-overlay]");
    const iconSidenav = document.querySelector("[icon-sidenav]");
    
    if (sidenavToggler) {
        sidenavToggler.forEach(item => {
            item.addEventListener("click", function() {
                if (sidenav && overlay) {
                    sidenav.classList.toggle("translate-x-0");
                    overlay.classList.toggle("hidden");
                }
            });
        });
    }
    
    if (overlay) {
        overlay.addEventListener("click", function() {
            if (sidenav && overlay) {
                sidenav.classList.remove("translate-x-0");
                overlay.classList.add("hidden");
            }
        });
    }
    
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024 && sidenav) {
            sidenav.classList.add("translate-x-0");
            if (overlay) overlay.classList.add("hidden");
        } else if (sidenav) {
            sidenav.classList.remove("translate-x-0");
        }
    });
}

// Função para inicializar dropdowns
function initDropdowns() {
    const dropdownButtons = document.querySelectorAll("[dropdown-trigger]");
    
    if (dropdownButtons) {
        dropdownButtons.forEach(button => {
            button.addEventListener("click", function() {
                const dropdownID = this.getAttribute("dropdown-trigger");
                const dropdown = document.querySelector(`[dropdown-menu="${dropdownID}"]`);
                
                if (dropdown) {
                    dropdown.classList.toggle("hidden");
                    dropdown.classList.toggle("opacity-0");
                    dropdown.classList.toggle("opacity-100");
                }
            });
        });
        
        window.addEventListener("click", function(e) {
            dropdownButtons.forEach(button => {
                const dropdownID = button.getAttribute("dropdown-trigger");
                const dropdown = document.querySelector(`[dropdown-menu="${dropdownID}"]`);
                
                if (dropdown && !button.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add("hidden");
                    dropdown.classList.add("opacity-0");
                    dropdown.classList.remove("opacity-100");
                }
            });
        });
    }
}

// Função para inicializar tooltips
function initTooltips() {
    const tooltipTriggers = document.querySelectorAll("[tooltip-target]");
    
    if (tooltipTriggers) {
        tooltipTriggers.forEach(trigger => {
            trigger.addEventListener("mouseenter", function() {
                const tooltipID = this.getAttribute("tooltip-target");
                const tooltip = document.querySelector(`[tooltip="${tooltipID}"]`);
                
                if (tooltip) {
                    tooltip.classList.remove("hidden");
                    tooltip.classList.remove("opacity-0");
                    tooltip.classList.add("opacity-100");
                    
                    // Posicionar o tooltip
                    const rect = this.getBoundingClientRect();
                    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
                    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
                }
            });
            
            trigger.addEventListener("mouseleave", function() {
                const tooltipID = this.getAttribute("tooltip-target");
                const tooltip = document.querySelector(`[tooltip="${tooltipID}"]`);
                
                if (tooltip) {
                    tooltip.classList.add("hidden");
                    tooltip.classList.add("opacity-0");
                    tooltip.classList.remove("opacity-100");
                }
            });
        });
    }
}

// Função para inicializar efeito ripple
function initRipple() {
    const rippleButtons = document.querySelectorAll("[ripple]");
    
    if (rippleButtons) {
        rippleButtons.forEach(button => {
            button.addEventListener("click", function(e) {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement("span");
                ripple.classList.add("ripple");
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 1000);
            });
        });
    }
}

// Função para inicializar perfect scrollbar
function initPerfectScrollbar() {
    // Implementação simplificada - em produção, você precisaria importar a biblioteca Perfect Scrollbar
    const scrollElements = document.querySelectorAll("[perfect-scrollbar]");
    
    if (scrollElements.length > 0) {
        console.log("Perfect Scrollbar: Para usar este recurso, importe a biblioteca Perfect Scrollbar.");
    }
}

// Função para inicializar navbar fixa
function initNavbarFixed() {
    const navbar = document.querySelector("[navbar-main]");
    
    if (navbar) {
        window.addEventListener("scroll", function() {
            if (window.scrollY > 10) {
                navbar.classList.add("backdrop-saturate-200");
                navbar.classList.add("backdrop-blur-2xl");
                navbar.classList.add("bg-white/80");
                navbar.classList.add("shadow-blur");
            } else {
                navbar.classList.remove("backdrop-saturate-200");
                navbar.classList.remove("backdrop-blur-2xl");
                navbar.classList.remove("bg-white/80");
                navbar.classList.remove("shadow-blur");
            }
        });
    }
} 
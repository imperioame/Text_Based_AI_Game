export function callTooltip(where, mesaje, color) {
    //This function generates a small tooltip with the given text and color.
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.style.bottom = document.getElementById(where).offsetHeight * -1.5 + 'px';
    
    const icon = document.createElement('i');
    icon.classList.add('fa-solid');
    icon.classList.add('fa-circle-info');
    icon.style.color = `var(--${color})`;

    tooltip.appendChild(icon);

    const mesaje_html = document.createElement('p');
    mesaje_html.innerHTML = mesaje;
    mesaje_html.style.color = `var(--${color})`;
    tooltip.appendChild(mesaje_html);




    document.getElementById(where).parentNode.appendChild(tooltip);
    setTimeout(function () {
        document.getElementsByClassName('tooltip')[0].remove();
    }, 10000);

}
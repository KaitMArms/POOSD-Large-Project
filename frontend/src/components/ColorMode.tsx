// Code for maintaining color mode across pages
function Mode()
{
    const currentMode = localStorage.getItem('theme');
    if(currentMode ==='light')
    {
        document.body.classList.add('light-mode')
    }

    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
}
export default Mode;

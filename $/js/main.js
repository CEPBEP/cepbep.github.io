const terminal = document.querySelector('#terminal')
const IPFS = document.querySelector('#IPFS')
const about = document.querySelector('#about')
const contact = document.querySelector('#contact')

const terminalContent = document.querySelector('#terminal-content')
const IPFSContent = document.querySelector('#IPFS-content')
const aboutContent = document.querySelector('#about-content')
const contactContent = document.querySelector('#contact-content')


terminal.addEventListener('click', () => {
  const terminalBox = new WinBox({
    title: '>_ |',
    width: '300px',
    height: '300px',
    top:0,
    right:0,
    left:0,
    x: "center",
    y: "center",
    // mount: terminalContent,
    url: "https://cepbep.github.io/code/frame.html",
  })
})

IPFS.addEventListener('click', () => {
  const IPFSBox = new WinBox({
    title: 'IPFS',
    width: '300px',
    height: '300px',
    top:0,
    right:0,
    left:0,
    x: "center",
    y: "center",
    // mount: IPFSContent,
    url: "https://webui.ipfs.io/",
  })
})

about.addEventListener('click', () => {
  const aboutBox = new WinBox({
    title: 'AI',
    width: '300px',
    height: '300px',
    top:0,
    right:0,
    left:0,
    x: "center",
    y: "center",
    mount: aboutContent,
  })
})

/*about.addEventListener('click', () => {
  const aboutBox = new WinBox({
    title: 'About Me',
    width: '300px',
    height: '300px',
    top:0,
    right:0,
    left:0,
    x: "center",
    y: "center",
    url: "https://humanphenotype.github.io/",
    oncreate: function(options){
      this.setOverflow-x("Hidden");
  }
  })
})*/

contact.addEventListener('click', () => {
  const contactBox = new WinBox({
    title: 'SORA',
    width: '300px',
    height: '300px',
    top:0,
    right:0,
    left:0,
    x: "center",
    y: "center",
    mount: contactContent,
  })
})
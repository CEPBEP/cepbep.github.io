document.querySelector('#text').addEventListener('input', () => {
  const txt = document.querySelector('#text').value;
  const encoded = buffer.Buffer.from(txt).toString('base64');
  document.querySelector('#encoded').innerText = encoded;
  const decoded = buffer.Buffer.from(encoded, 'base64').toString();
  document.querySelector('#decoded').innerText = decoded;
  console.log(encoded+"\n"+decoded);
});

document.addEventListener('DOMContentLoaded', async () => {
  const node = await Ipfs.create({ repo: 'ipfs-' + Math.random() })
  window.node = node

  const status = node.isOnline() ? 'green' : 'red'

  console.log(`Node status: ${status}`)
  document.getElementById('status').innerHTML = `<span class="${status}"></span>`

})

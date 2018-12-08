# Uptime Monitor

A nodejs app to help monitor websites with no framework no libraries used.

This example project also uses some of node modules/apis such as `async_hooks`, `tls`, `net`, `repl`, etc. to gain knowledge about them.

### Installation
Do: `git clone https://github.com/kennedy-osaze/uptime-monitor.git`

In the `https folder` do the following to obtain a self-signed certificate:<br>
`openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem`

Run: `node index.js`

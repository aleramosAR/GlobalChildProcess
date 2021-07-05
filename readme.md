# Global Process y Child Process

**Incializar la app normalmente**
npm start

**Incializar la app pasando argumentos**<br />
npm run startFB
Arrancando con `npm run startFB` va a llamar al script
`node server 559885825005670 6a2926fd1ded556381f2275ddfbee1f2` que inicializa la app pasandole el FACEBOOK_CLIENT_ID FACEBOOK_CLIENT_SECRET por parametros.<br />
Si no se les pasa toma los que tiene definidos por defecto.

<hr />

**Ingreso a la app principal (reenvia a login por FB)**<br />
http://localhost:8080/

<hr />

**URL para mostrar los datos del process**<br />
http://localhost:8080/info

<hr />

**URL contadora de visitas**<br />
http://localhost:8080/visitas<br />
Para testear si el proceso esta trabado o no por el generador de números random.

<hr />

**Generador de números random**<br />
http://localhost:8080/randoms<br />
http://localhost:8080/randoms?cant=20000<br />
Si se le pasa el parametro cant genera tantos nros como se le pase, y si no, genera 100000000 números.<br />
Muestra un objeto con los nros generados y la cantidad de veces que se genero c/u.

<hr />

**URL para ejectuar la salida del proceso**<br />
http://localhost:8080/exit<br />
Va a hacer un log con el codigo de salida y ejecutar `process.exit();`<br />
La pagina va a mostrar solo un mensaje de "Salida del proceso de node.js"

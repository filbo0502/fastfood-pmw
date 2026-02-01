# Relazione Tecnica - FastFood PMW (CodeBite)

**Progetto**: Sistema di Gestione Ordini per Ristoranti Fast Food  
**Nome Applicazione**: CodeBite  
**Anno Accademico**: 2025/2026  
**Corso**: Programmazione Web e Mobile

---

<!--toc:start-->
- [Introduzione](#introduzione)
  - [Autore](#autore)
  - [Link ed informazioni utili](#link-ed-informazioni-utili)
  - [Panoramica del Progetto](#panoramica-del-progetto)
- [Struttura dell'Applicazione](#struttura-dellapplicazione)
  - [Front-End](#front-end)
    - [Directory HTML](#directory-html)
    - [Directory CSS](#directory-css)
    - [Directory Scripts](#directory-scripts)
  - [Back-End](#back-end)
    - [NODEJS](#nodejs)
    - [COS'È NODEJS ED EXPRESS](#cosè-nodejs-ed-express)
    - [File NODEJS](#file-nodejs)
  - [Database MONGODB](#database-mongodb)
    - [USERS](#users)
    - [RESTAURANTS](#restaurants)
    - [MEALS](#meals)
    - [ORDERS](#orders)
- [Configurazione dell'applicazione](#configurazione-dellapplicazione)
- [Scelte implementative e features](#scelte-implementative-e-features)
  - [Swagger JS](#swagger-js)
  - [File SWAGGER.JS](#file-swaggerjs)
  - [Interfaccia grafica SWAGGER](#interfaccia-grafica-swagger)
  - [Gestione codici HTTP](#gestione-codici-http)
  - [Autenticazione JWT](#autenticazione-jwt)
  - [Validazione Input](#validazione-input)
  - [Upload File](#upload-file)
- [Esempi di Utilizzo](#esempi-di-utilizzo)
  - [Homepage](#homepage)
  - [Registrazione](#registrazione)
  - [Login](#login)
  - [Ricerca Ristoranti](#ricerca-ristoranti)
  - [Ricerca Piatti](#ricerca-piatti)
  - [Documentazione API](#documentazione-api)
- [Lingua](#lingua)
<!--toc:end-->

# Introduzione

Questo documento rappresenta la relazione del progetto "FastFood PMW - CodeBite", sviluppato nel contesto del corso "Programmazione Web e Mobile" durante l'anno accademico 2025/2026.

**CodeBite** è una piattaforma web completa per la gestione di ordini di cibo da asporto e consegna a domicilio, che permette agli utenti di cercare ristoranti, sfogliare menu, effettuare ordini e tracciare lo stato delle consegne. I ristoratori possono gestire il proprio ristorante, creare e modificare menu, gestire ordini in arrivo e visualizzare statistiche.

## Autore

Il progetto è stato realizzato da:

- **Filippo Bottaro** - [GitHub Profile](https://github.com/filbo0502)

## Link ed informazioni utili

- La pagina GitHub del progetto si trova a [questo link](https://github.com/filbo0502/fastfood-pmw)
- Repository: `https://github.com/filbo0502/fastfood-pmw.git`
- Versione: 1.0.0

## Panoramica del Progetto

### Obiettivi del Sistema

- Fornire un'interfaccia intuitiva per l'ordinazione di cibo online
- Permettere ai ristoratori di gestire autonomamente la propria attività
- Garantire sicurezza nelle transazioni e nella gestione dei dati
- Offrire un sistema scalabile e manutenibile

### Stack Tecnologico

```mermaid
graph TB
    subgraph Frontend
        A[HTML5] --> D[Browser]
        B[CSS3/Bootstrap] --> D
        C[JavaScript ES6+] --> D
    end
    
    subgraph Backend
        E[Node.js] --> F[Express.js]
        F --> G[API REST]
    end
    
    subgraph Database
        H[MongoDB]
        I[Mongoose ODM]
    end
    
    subgraph Authentication
        J[JWT Tokens]
        K[bcryptjs]
    end
    
    D <--> G
    G <--> I
    I <--> H
    G --> J
    G --> K
```

**Tecnologie Principali**:
- **Backend**: Node.js v18+, Express.js v5.1.0
- **Database**: MongoDB con Mongoose ODM v8.15.1
- **Frontend**: HTML5, CSS3, JavaScript vanilla, Bootstrap 5.3.0
- **Autenticazione**: JWT (jsonwebtoken v9.0.2), bcryptjs v3.0.2
- **Documentazione API**: Swagger UI Express v5.0.1
- **Validazione**: Express Validator v7.2.1
- **Upload File**: Multer v2.0.2

---

# Struttura dell'Applicazione

## Front-End

> **Front End:**  
> Il Front-End è la parte dell'applicazione che si occupa dell'interfaccia utente e dell'interazione con l'utente. Si concentra sulla progettazione e sull'implementazione dell'aspetto visivo dell'applicazione e sulla gestione delle interazioni utente.

All'interno della directory `/frontend/`, sono presenti i seguenti elementi principali:

### Directory HTML

- `/pages/` - Questa directory contiene i file HTML che vengono renderizzati dal browser, determinando quindi l'interfaccia grafica dell'applicazione. Tutti i files sono stati validati per lo standard HTML5.

I file principali includono:
- `index.html` - _Pagina principale dell'applicazione_
- `/pages/login.html` - _Pagina di login per autenticazione utenti_
- `/pages/registration.html` - _Pagina di registrazione per nuovi utenti_
- `/pages/searchRestaurant.html` - _Interfaccia per la ricerca di ristoranti_
- `/pages/searchDish.html` - _Interfaccia per la ricerca di piatti_
- `/pages/restaurantDetails.html` - _Dettagli ristorante e menu_
- `/pages/order.html` - _Carrello e checkout ordini_
- `/pages/orderHistory.html` - _Storico ordini cliente_
- `/pages/profile.html` - _Profilo utente_
- `/pages/restaurantDashboard.html` - _Dashboard ristoratore_
- `/pages/menuManagement.html` - _Gestione menu ristorante_
- `/pages/restaurantOrders.html` - _Gestione ordini ristorante_
- `/pages/statistics.html` - _Statistiche ristorante_
- `/pages/about.html` - _Informazioni sull'applicazione_

### Directory CSS

- `/css/` - Questa directory contiene i file di stile che definiscono l'aspetto visivo dell'applicazione. Tutti i files sono stati validati per lo standard CSS3. I file principali sono:
  - `/frontend/css/styles.css` - _Questo file definisce lo stile generale dell'applicazione, inclusi colori, tipografia, layout responsive e componenti UI_

**Caratteristiche design**:
- **Responsive**: mobile-first design con Bootstrap 5.3.0
- **Navbar fissa**: navigazione sempre accessibile
- **Card moderne**: design pulito per ristoranti e piatti
- **Colori brand**: palette coerente (marrone/arancio per food)
- **Icone**: Font Awesome 6.4.0
- **Animazioni**: transizioni smooth per hover e interazioni

### Directory Scripts

- `/scripts/` - Questa directory contiene file JavaScript che gestiscono la logica del Front-End. Alcuni dei file principali includono:
  - `/frontend/js/auth.js` - _Questo file si occupa di verificare l'autenticazione dell'utente e aggiornare l'interfaccia in base allo stato di login_
  - `/frontend/js/config.js` - _Configurazione delle URL delle API e parametri dell'applicazione_
  - `/frontend/js/utils.js` - _Funzioni utility condivise tra tutti i moduli (API calls, toast notifications)_
  - `/frontend/js/login.js` - _Questo file si occupa di tutte le operazioni necessarie al login dell'utente_
  - `/frontend/js/registration.js` - _Questo file si occupa delle operazioni necessarie alla registrazione di un utente. Gestisce form dinamici per customer e restaurateur_
  - `/frontend/js/search.js` - _Gestione ricerca ristoranti con filtri e visualizzazione risultati_
  - `/frontend/js/searchDish.js` - _Gestione ricerca piatti per categoria e ingredienti_
  - `/frontend/js/restaurantDetails.js` - _Visualizzazione dettagli ristorante, menu e aggiunta al carrello_
  - `/frontend/js/order.js` - _Gestione carrello, checkout e creazione ordini_
  - `/frontend/js/orderHistory.js` - _Visualizzazione storico ordini cliente_
  - `/frontend/js/profile.js` - _Gestione profilo utente e modifica dati_
  - `/frontend/js/menuManagement.js` - _Gestione menu ristorante (aggiunta, modifica, rimozione piatti)_
  - `/frontend/js/restaurantOrders.js` - _Gestione ordini in arrivo per ristoratori_
  - `/frontend/js/statistics.js` - _Visualizzazione statistiche vendite ristorante_

La suddivisione chiara tra file HTML, file CSS e file JavaScript consente una gestione efficiente del Front-End e garantisce un'esperienza utente di alta qualità.

## Back-End

> **Back End:**  
> Il Back-End è responsabile delle funzionalità e della logica dell'applicazione lato server. Esso comprende una serie di elementi chiave presenti nella nostra struttura di lavoro.

### NODEJS

#### COS'È NODEJS ED EXPRESS

**Node.js** ed **Express** costituiscono un binomio potente nell'ambito dello sviluppo web di applicazioni scalabili ed efficienti.  
*Node.js* fornisce un ambiente runtime JavaScript server-side, ottimizzato per l'efficienza e la scalabilità.  
*Express*, un framework web basato su Node.js, semplifica la creazione di applicazioni web, offrendo funzionalità come la gestione delle richieste HTTP, routing, middleware e autenticazione.

**Architettura del Server**:

```mermaid
graph LR
    A[Client Browser] -->|HTTP/HTTPS| B[Express Server]
    B -->|REST API| C[Controllers]
    C -->|Business Logic| D[Models]
    D -->|Mongoose| E[(MongoDB)]
    B -->|JWT Auth| F[Auth Middleware]
    B -->|Static Files| G[Frontend Assets]
```

#### File NODEJS

- `/config/` - Questa cartella contiene i file dedicati alla configurazione dell'applicazione, ad eccezione delle variabili d'ambiente. Al suo interno, sono presenti:
  - `database.js` - _Questo file gestisce la connessione a MongoDB utilizzando Mongoose_

- `/controllers/` - Directory contenente la logica di business dell'applicazione:
  - `authController.js` - _Gestione autenticazione, login, registrazione e logout_
  - `userController.js` - _Gestione profili utente (lettura, aggiornamento, eliminazione)_
  - `restaurantController.js` - _Gestione ristoranti (CRUD operations)_
  - `mealController.js` - _Gestione piatti e ricette_
  - `orderController.js` - _Gestione ordini (creazione, aggiornamento stato)_
  - `searchController.js` - _Logica di ricerca ristoranti e piatti_
  - `statisticsController.js` - _Calcolo statistiche vendite ristoranti_

- `/models/` - La directory models contiene gli schemi Mongoose per le collezioni MongoDB:
  - `User.js` - _Schema utenti con validazione e hashing password_
  - `Restaurant.js` - _Schema ristoranti con menu embedded_
  - `Meal.js` - _Schema piatti con ingredienti e allergie_
  - `Order.js` - _Schema ordini con stati e tracking_

- `/routes/` - Definizione degli endpoint API:
  - `authRoutes.js` - _Routes per autenticazione_
  - `userRoutes.js` - _Routes per gestione utenti_
  - `restaurantRoutes.js` - _Routes per gestione ristoranti_
  - `mealRoutes.js` - _Routes per gestione piatti_
  - `orderRoutes.js` - _Routes per gestione ordini_
  - `statisticsRoutes.js` - _Routes per statistiche_

- `/middlewares/` - Middleware personalizzati:
  - `authMiddleware.js` - _Verifica token JWT e protezione routes_

- `/utils/` - Funzioni utility:
  - `regex.js` - _Pattern di validazione per email, password, ecc._
  - `importMeals.js` - _Script per importazione dati iniziali_
  - `waitTime.js` - _Calcolo tempi di attesa e preparazione_

- `server.js` - Questo file rappresenta il punto di ingresso principale dell'applicazione, contenente le istruzioni per l'avvio dell'app e la definizione degli endpoint.

- `swagger.js` e `swagger.json` - File per la generazione e configurazione della documentazione API Swagger.

La struttura ben organizzata del Back-End garantisce una gestione efficiente delle funzionalità server-side e contribuisce al corretto funzionamento dell'applicazione.

## Database MONGODB

Nel corso di sviluppo dell'applicazione, è stato fatto largo uso del database MongoDB. Qui di seguito, vengono presentate le collezioni che sono state create e utilizzate per immagazzinare i dati essenziali dell'applicazione.

> **MongoDB:**  
> MongoDB è un database NoSQL (non relazionale), flessibile e scalabile, noto per la sua struttura orientata ai documenti. Un documento è un record dati in formato BSON (Binary JSON) che può contenere dati di varie forme e dimensioni. Ogni documento è organizzato in *collezioni*, offrendo flessibilità nella modellazione dei dati.  
> Per lo sviluppo di questa applicazione è stato deciso di utilizzare MongoDB per la sua flessibilità nella gestione di strutture dati complesse come menu e ordini.

Per questa applicazione sono state utilizzate le seguenti collections:
- **users**: Collezione che gestisce i dati degli utenti (clienti e ristoratori)
- **restaurants**: Collezione che gestisce informazioni dei ristoranti e menu
- **meals**: Collezione che gestisce i piatti disponibili (catalogo e custom)
- **orders**: Collezione che gestisce gli ordini effettuati

Di seguito viene riportata una descrizione delle collections e del loro schema.

### USERS

#### DESCRIZIONE

La collezione *users* è destinata a contenere i dati degli utenti all'interno dell'applicazione. Supporta due tipi di utenti: **customer** (clienti) e **restaurateur** (ristoratori).

#### ATTRIBUTI

- **_id**: identificatore univoco di un utente, di tipo ObjectId. È un campo obbligatorio per identificare univocamente un utente nel database.

- **name**: nome dell'utente, di tipo stringa. È un campo obbligatorio e contiene il nome dell'utente. Validato tramite regex.

- **surname**: cognome dell'utente, di tipo stringa. È un campo obbligatorio e contiene il cognome dell'utente. Validato tramite regex.

- **email**: indirizzo email dell'utente, di tipo stringa. È un campo obbligatorio, univoco e contiene l'indirizzo email dell'utente. Validato tramite regex per formato email.

- **password**: password dell'utente, di tipo stringa. È un campo obbligatorio e contiene la password dell'utente cifrata con bcrypt (10 salt rounds). Minimo 8 caratteri.

- **userType**: tipo di utente, di tipo stringa. È un campo obbligatorio con valori possibili: `'customer'` o `'restaurateur'`.

- **restaurant**: riferimento al ristorante (solo per ristoratori), di tipo ObjectId. Campo opzionale che referenzia la collezione restaurants.

- **paymentInfo**: informazioni di pagamento (solo per clienti), oggetto contenente:
  - `cardType`: tipo di carta (Visa, Mastercard, ecc.)
  - `cardNumb`: numero carta
  - `CVC`: codice sicurezza
  - `expiryDate`: data scadenza

- **address**: indirizzo dell'utente, oggetto contenente:
  - `street`: via e numero civico
  - `city`: città
  - `zipCode`: codice postale

- **createdAt**: data di creazione dell'utente, di tipo Date. Generato automaticamente.

- **updatedAt**: data ultimo aggiornamento, di tipo Date. Aggiornato automaticamente da Mongoose timestamps.

#### HOOKS E MIDDLEWARE

- **Pre-save hook**: Hash automatico della password con bcrypt prima del salvataggio
- **Pre-delete hook**: Eliminazione cascade dei ristoranti quando si elimina un ristoratore

### RESTAURANTS

#### DESCRIZIONE

La collezione *restaurants* ha lo scopo di raccogliere l'anagrafica dei ristoranti e i relativi menu.

#### ATTRIBUTI

- **_id**: identificatore univoco di un ristorante, di tipo ObjectId. È un campo obbligatorio per identificare univocamente un ristorante nel database.

- **name**: nome del ristorante, di tipo stringa. È un campo obbligatorio e contiene il nome del ristorante.

- **owner**: identificatore del proprietario (ristoratore), di tipo ObjectId. È un campo obbligatorio e referenzia la collezione users.

- **description**: descrizione del ristorante, di tipo stringa. È un campo obbligatorio e contiene una descrizione testuale del ristorante.

- **phone**: numero di telefono del ristorante, di tipo stringa. È un campo obbligatorio.

- **vatNumber**: partita IVA del ristorante, di tipo stringa. È un campo obbligatorio per identificazione fiscale.

- **image**: path dell'immagine del ristorante, di tipo stringa. Campo opzionale, default null.

- **address**: indirizzo del ristorante, oggetto obbligatorio contenente:
  - `street`: via e numero civico (obbligatorio)
  - `city`: città (obbligatorio)
  - `zipCode`: codice postale (obbligatorio)
  - `coordinates`: oggetto opzionale con:
    - `latitude`: latitudine (Number)
    - `longitude`: longitudine (Number)

- **menu**: array di piatti nel menu, ogni elemento contiene:
  - `meal`: ObjectId che referenzia la collezione meals (obbligatorio)
  - `price`: prezzo del piatto in questo ristorante (Number, min: 0, obbligatorio)
  - `preparationTime`: tempo di preparazione in minuti (Number, min: 0, obbligatorio)
  - `isAvailable`: disponibilità del piatto (Boolean, default: true)

- **createdAt**: data di creazione del ristorante, di tipo Date. Generato automaticamente.

### MEALS

#### DESCRIZIONE

La collezione *meals* è stata creata per salvare i piatti disponibili nell'applicazione. Include sia piatti standard del catalogo che piatti personalizzati creati dai ristoratori.

#### ATTRIBUTI

- **_id**: identificatore univoco del piatto, di tipo ObjectId. È un campo obbligatorio per identificare univocamente un piatto nel database.

- **idMeal**: identificatore esterno del piatto, di tipo stringa. È un campo obbligatorio.

- **strMeal**: nome del piatto, di tipo stringa. È un campo obbligatorio e contiene il nome del piatto.

- **strCategory**: categoria del piatto, di tipo stringa. È un campo obbligatorio (es: "Burger", "Pizza", "Pasta").

- **strArea**: area geografica/cucina, di tipo stringa. È un campo obbligatorio (es: "Italian", "American", "Chinese").

- **strMealThumb**: URL dell'immagine del piatto, di tipo stringa. È un campo obbligatorio.

- **ingredients**: array di ingredienti, di tipo array di stringhe. Contiene la lista degli ingredienti del piatto.

- **allergies**: array di allergeni, di tipo array di stringhe. Contiene la lista degli allergeni presenti (es: "Glutine", "Lattosio").

- **isCustom**: flag piatto personalizzato, di tipo Boolean. Default: false. Indica se il piatto è stato creato da un ristoratore (true) o fa parte del catalogo standard (false).

- **createdBy**: riferimento al ristorante creatore (solo per piatti custom), di tipo ObjectId. Campo opzionale che referenzia la collezione restaurants.

- **createdAt**: data di creazione del piatto, di tipo Date. Generato automaticamente.

### ORDERS

#### DESCRIZIONE

La collezione *orders* è stata creata per salvare gli ordini effettuati dai clienti presso i ristoranti.

#### ATTRIBUTI

- **_id**: identificatore univoco dell'ordine, di tipo ObjectId. È un campo obbligatorio per identificare univocamente un ordine nel database.

- **customer**: identificatore del cliente, di tipo ObjectId. È un campo obbligatorio e referenzia la collezione users.

- **restaurant**: identificatore del ristorante, di tipo ObjectId. È un campo obbligatorio e referenzia la collezione restaurants.

- **items**: array di piatti ordinati, ogni elemento contiene:
  - `meal`: ObjectId che referenzia la collezione meals (obbligatorio)
  - `quantity`: quantità ordinata (Number, default: 1, obbligatorio)
  - `price`: prezzo unitario al momento dell'ordine (Number, obbligatorio)
  - `preparationTime`: tempo di preparazione in minuti (Number, obbligatorio)

- **totalAmount**: importo totale dell'ordine, di tipo Number. È un campo obbligatorio calcolato come somma di (price * quantity) per ogni item.

- **status**: stato dell'ordine, di tipo stringa. È un campo obbligatorio con valori possibili:
  - `'ordered'`: ordine appena creato (default)
  - `'preparing'`: in preparazione
  - `'delivering'`: in consegna
  - `'delivered'`: consegnato

- **deliveryType**: tipo di consegna, di tipo stringa. È un campo obbligatorio con valori possibili:
  - `'pickup'`: ritiro al ristorante
  - `'delivery'`: consegna a domicilio

- **deliveryAddress**: indirizzo di consegna (solo per delivery), oggetto opzionale contenente:
  - `street`: via e numero civico
  - `city`: città
  - `zipCode`: codice postale
  - `country`: nazione
  - `coordinates`: oggetto con latitude e longitude

- **estimatedPreparationTime**: tempo stimato di preparazione totale, di tipo Number. È un campo obbligatorio calcolato in base ai tempi dei singoli piatti.

- **createdAt**: data di creazione dell'ordine, di tipo Date. Generato automaticamente.

---

# Configurazione dell'applicazione

Il progetto necessita di un file `.env` nella directory principale dove sono contenuti i parametri necessari per il funzionamento.

Il file `.env` è gestito attraverso il pacchetto npm [dotenv](https://www.npmjs.com/package/dotenv) che si occupa di popolare le relative variabili d'ambiente e renderne semplice l'utilizzo e accesso tramite JavaScript.

*Un esempio di file .env*

```sh
# Server HOST and PORT
HOST='localhost'
PORT=3001

# Parametri MongoDB
MONGO_URI=mongodb://localhost:27017/fastfood-pmw
# oppure per MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fastfood-pmw?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=your_super_secret_jwt_key_change_in_production_with_long_random_string

# Node Environment
NODE_ENV=development
```

**Note importanti**:
- `JWT_SECRET` deve essere cambiato in produzione con una stringa casuale lunga e sicura
- `MONGO_URI` deve puntare al database MongoDB (locale o cloud come MongoDB Atlas)
- `NODE_ENV` deve essere impostato su `production` in ambiente di produzione
- `PORT` definisce la porta su cui il server Express sarà in ascolto

---

# Scelte implementative e features

## Swagger JS

> **Swagger:**  
> è un framework open-source per la progettazione, la creazione e la documentazione di API RESTful. La sua utilità si concentra sulla semplificazione del processo di sviluppo API, consentendo agli sviluppatori di definire chiaramente le specifiche delle API, testarle e generare automaticamente documentazione dettagliata.

Per la generazione dello swagger è stato utilizzato il module [swagger-autogen](https://www.npmjs.com/package/swagger-autogen) insieme a [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express).

Tramite la creazione di un file *swagger.js* (`/backend/swagger.js`) con una apposita configurazione, è possibile generare automaticamente una documentazione completa per tutti gli endpoint dell'applicazione.

È possibile visualizzare lo swagger generato all'endpoint **/api/swagger**

### File SWAGGER.JS

> **NB**: Il codice riportato di seguito rappresenta la configurazione utilizzata in questa applicazione!

```javascript
import swaggerAutogen from 'swagger-autogen';

const document = {
    info: {
        title: 'FastFood PMW API',
        description: 'API REST per la piattaforma FastFood PMW - Sistema di gestione ordini per ristoranti fast food',
        version: '1.0.0'
    },
    host: 'localhost:3001',
    basePath: '/',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            name: 'Authentication',
            description: 'Endpoints per autenticazione e registrazione utenti'
        },
        {
            name: 'Users',
            description: 'Gestione profili utente'
        },
        {
            name: 'Restaurants',
            description: 'Gestione ristoranti e menu'
        },
        {
            name: 'Meals',
            description: 'Gestione piatti e ricette'
        },
        {
            name: 'Orders',
            description: 'Gestione ordini'
        },
        {
            name: 'Statistics',
            description: 'Statistiche ristoranti'
        }
    ],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Inserire il token JWT nel formato: Bearer {token}'
        }
    },
    definitions: {
        User: {
            _id: "507f1f77bcf86cd799439011",
            name: "Mario",
            surname: "Rossi",
            email: "mario.rossi@example.com",
            userType: "customer"
        },
        Restaurant: {
            _id: "507f1f77bcf86cd799439012",
            name: "Burger King Milano Centro",
            owner: "507f1f77bcf86cd799439011",
            description: "Il miglior fast food di Milano",
            phone: "+39 02 1234567",
            vatNumber: "IT12345678901"
        },
        Order: {
            _id: "507f1f77bcf86cd799439014",
            customer: "507f1f77bcf86cd799439011",
            restaurant: "507f1f77bcf86cd799439012",
            totalAmount: 17.00,
            status: "ordered",
            deliveryType: "delivery"
        }
    }
};

const endpointFile = ['./server.js'];
const outputFile = './swagger.json';

swaggerAutogen(outputFile, endpointFile, document).then(async () => {
    await import('./server.js');
});
```

### Interfaccia grafica SWAGGER

La documentazione Swagger fornisce un'interfaccia interattiva completa:

![Swagger API - Header](file:///Users/filippobottaro/.gemini/antigravity/brain/461bc976-5b1a-4ae8-a1dc-b8f79365ed40/swagger_top_1769957733468.png)

![Swagger API - Endpoints](file:///Users/filippobottaro/.gemini/antigravity/brain/461bc976-5b1a-4ae8-a1dc-b8f79365ed40/swagger_endpoints_1769957733766.png)

**Funzionalità Swagger UI**:
- Lista completa di tutti gli endpoint organizzati per tag
- Descrizione dettagliata di ogni endpoint
- Parametri richiesti (body, query, path)
- Schemi dati con esempi
- Possibilità di testare le API direttamente dall'interfaccia ("Try it out")
- Codici di risposta HTTP con esempi
- Autenticazione Bearer token integrata

### Installazione

```bash
npm install --save-dev swagger-autogen
npm install swagger-ui-express
```

Ulteriori informazioni sono presenti ai link sopra riportati.

---

## Gestione codici HTTP

> I codici HTTP sono standard utilizzati per indicare lo stato di una richiesta HTTP effettuata tra un client (spesso un browser web) e un server. Nell'applicazione, vengono ampiamente utilizzati alcuni di questi codici per comunicare lo stato delle richieste e delle risposte:

- **Codice 200 (OK)**: Codice di successo. Indica che la richiesta è stata elaborata correttamente e che il server sta restituendo i dati richiesti al client.

- **Codice 201 (CREATED)**: Indica che una nuova risorsa è stata creata con successo (es: nuovo utente, nuovo ordine).

- **Codice 400 (BAD REQUEST)**: Questo codice indica che la richiesta effettuata dal client è stata malformata o non valida. Viene utilizzato quando i dati inviati non corrispondono alle aspettative del server o falliscono la validazione.

- **Codice 401 (UNAUTHORIZED)**: Indica che l'accesso a una risorsa richiede l'autenticazione. Utilizzato quando il token JWT è mancante, scaduto o non valido.

- **Codice 403 (FORBIDDEN)**: Indica che l'utente autenticato non ha i permessi necessari per accedere alla risorsa richiesta.

- **Codice 404 (NOT FOUND)**: Indica che la risorsa richiesta non è stata trovata sul server. Utilizzato quando si cerca un ristorante, piatto o ordine inesistente.

- **Codice 500 (INTERNAL SERVER ERROR)**: Questo codice indica un errore interno del server. Utilizzato quando si verifica un'eccezione non gestita o un errore del database.

---

## Autenticazione JWT

L'applicazione utilizza **JSON Web Tokens (JWT)** per l'autenticazione degli utenti.

**Flusso di autenticazione**:

1. **Registrazione/Login**: L'utente invia credenziali (email e password)
2. **Verifica**: Il server verifica le credenziali
3. **Generazione Token**: Se valide, il server genera un JWT contenente userId e userType
4. **Invio Token**: Il token viene inviato al client
5. **Storage**: Il client salva il token in localStorage
6. **Richieste Autenticate**: Per ogni richiesta protetta, il client invia il token nell'header Authorization
7. **Verifica Token**: Il middleware `authMiddleware.js` verifica la validità del token
8. **Accesso**: Se valido, la richiesta procede; altrimenti viene restituito 401 Unauthorized

**Implementazione**:

```javascript
// Generazione token al login
const token = jwt.sign(
    { userId: user._id, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

// Middleware di verifica
const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password');
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token not valid' });
    }
};
```

**Scelte implementative**:
- Token nel header Authorization con formato `Bearer <token>`
- Scadenza 7 giorni per bilanciamento tra sicurezza e UX
- Payload minimo (solo userId e userType) per ridurre dimensione
- Password sempre esclusa dalle query con `.select('-password')`

---

## Validazione Input

L'applicazione implementa una **doppia validazione** degli input:

1. **Client-side** (JavaScript): Validazione immediata per migliorare UX
2. **Server-side** (Express Validator): Validazione sicura e definitiva

**Esempio validazione registrazione**:

```javascript
const registrationValidationRules = [
    body('name', 'Name must be provided.').not().isEmpty(),
    body('surname', 'Surname must be provided.').not().isEmpty(),
    body('email', 'Please, insert a valid email address.').isEmail(),
    body('password', 'Password must be at least 8 characters.').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => {
        if(value !== req.body.password) {
            throw new Error('Passwords do not match!');
        }
        return true;
    }),
    body('userType', 'You must select a user type.').isIn(['customer', 'restaurateur']),
    // Validazioni condizionali per ristoratori
    body('restaurantName').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('vatNumber').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('phone').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('addressStreet').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('addressCity').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('addressZip').if(body('userType').equals('restaurateur')).not().isEmpty()
];
```

**Pattern regex personalizzati** (`/backend/utils/regex.js`):
- Email: validazione formato email standard
- Password: minimo 8 caratteri con requisiti di complessità
- Nome e Cognome: solo caratteri alfabetici e spazi

---

## Upload File

L'applicazione supporta l'upload di immagini per i ristoranti utilizzando **Multer**.

**Configurazione**:

```javascript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF)'));
    }
});
```

**Caratteristiche**:
- Limite dimensione: 5MB per file
- Tipi consentiti: JPEG, JPG, PNG, GIF
- Nome univoco: timestamp + numero random per evitare collisioni
- Directory dedicata: `/uploads` servita staticamente da Express
- Validazione tipo file: controllo sia estensione che MIME type

---

# Esempi di Utilizzo

## Homepage

![Homepage CodeBite](file:///Users/filippobottaro/.gemini/antigravity/brain/461bc976-5b1a-4ae8-a1dc-b8f79365ed40/homepage_overview_1769957668071.png)

**Elementi visibili**:
- **Navbar**: Logo CodeBite, menu navigazione (Home, About, Restaurants, Dishes, Contact)
- **Hero section**: Titolo "Food Delivery Made Easy" con descrizione
- **Call-to-action**: Pulsanti "Order Now" e "Learn More"
- **Sezione servizi**: Browse Restaurants, Place Your Order, Fast Delivery
- **Footer**: Link utili e tecnologie utilizzate (Node.js, Express, MongoDB)

**Funzionalità**:
- Design responsive per tutti i dispositivi
- Animazioni smooth su hover delle card servizi
- Navbar con effetto blur allo scroll
- Link funzionanti a tutte le sezioni principali

## Registrazione

![Pagina Registrazione](file:///Users/filippobottaro/.gemini/antigravity/brain/461bc976-5b1a-4ae8-a1dc-b8f79365ed40/registration_page_1769957682719.png)

**Elementi visibili**:
- **Form registrazione**: Campi per Nome, Cognome, Email, Password, Conferma Password
- **Selezione tipo utente**: Dropdown per scegliere tra Customer e Restaurateur
- **Campi condizionali**: Campi aggiuntivi per ristoratori (nascosti di default)
- **Validazione visiva**: Indicatori per campi obbligatori e errori

**Funzionalità**:
- Form dinamico che mostra/nasconde campi in base al tipo utente selezionato
- Validazione client-side in tempo reale
- Upload immagine ristorante (solo per ristoratori)
- Gestione errori con messaggi specifici
- Creazione account customer o restaurateur con ristorante associato

## Login

![Pagina Login](file:///Users/filippobottaro/.gemini/antigravity/brain/461bc976-5b1a-4ae8-a1dc-b8f79365ed40/login_page_1769957695717.png)

**Elementi visibili**:
- **Form login**: Campi per Email e Password
- **Toggle password**: Icona per mostrare/nascondere password
- **Link registrazione**: Per nuovi utenti
- **Pulsante login**: Submit del form

**Funzionalità**:
- Autenticazione con email e password
- Generazione e salvataggio token JWT
- Redirect automatico alla pagina appropriata dopo login
- Gestione errori (credenziali errate, account non esistente)
- Toggle visibilità password per migliorare UX

## Ricerca Ristoranti

![Ricerca Ristoranti](file:///Users/filippobottaro/.gemini/antigravity/brain/461bc976-5b1a-4ae8-a1dc-b8f79365ed40/restaurant_search_page_1769957708303.png)

**Elementi visibili**:
- **Barra ricerca**: Input per cercare ristoranti per nome
- **Titolo**: "Discover Amazing Restaurants"
- **Navbar completa**: Con tutte le opzioni di navigazione

**Funzionalità**:
- Caricamento automatico lista ristoranti all'apertura
- Ricerca in tempo reale con debouncing
- Filtri per città e categoria cucina
- Visualizzazione card responsive con immagini
- Click su card per accedere ai dettagli e menu del ristorante

## Ricerca Piatti

![Ricerca Piatti](file:///Users/filippobottaro/.gemini/antigravity/brain/461bc976-5b1a-4ae8-a1dc-b8f79365ed40/dish_search_page_1769957719965.png)

**Elementi visibili**:
- **Barra ricerca**: Input per cercare piatti per nome
- **Titolo**: "Find Your Favorite Dish"
- **Layout griglia**: Design responsive per visualizzazione piatti

**Funzionalità**:
- Caricamento catalogo completo piatti
- Ricerca per nome piatto in tempo reale
- Filtri per categoria (Burger, Pizza, Pasta, Dessert, etc.)
- Visualizzazione ingredienti e informazioni allergeni
- Click per vedere dettagli piatto e ristoranti che lo offrono

## Documentazione API

![Swagger API Documentation](file:///Users/filippobottaro/.gemini/antigravity/brain/461bc976-5b1a-4ae8-a1dc-b8f79365ed40/swagger_top_1769957733468.png)

![Swagger API Endpoints](file:///Users/filippobottaro/.gemini/antigravity/brain/461bc976-5b1a-4ae8-a1dc-b8f79365ed40/swagger_endpoints_1769957733766.png)

**Elementi visibili**:
- **Header**: Titolo "FastFood PMW API" con versione 1.0.0
- **Descrizione**: Sistema di gestione ordini per ristoranti fast food
- **Base URL**: localhost:3001
- **Sezioni organizzate**: Authentication, Users, Restaurants, Meals, Orders, Statistics

**Funzionalità**:
- Documentazione auto-generata da codice
- Tutti gli endpoint documentati con parametri e risposte
- Schemi dati completi (User, Restaurant, Meal, Order)
- Esempi di richieste e risposte
- Interfaccia "Try it out" per testare API direttamente
- Supporto autenticazione Bearer token

---

# Lingua

La scelta di utilizzare la lingua inglese come standard di programmazione è ampiamente diffusa nell'industria del software ed è guidata principalmente dal desiderio di aderire allo standard internazionale. Questo standard è anche noto nella community di programmatori come **"English-based programming"**.

Adottare questa convenzione ha numerosi vantaggi:
- Rende il codice più leggibile e comprensibile per un pubblico globale di sviluppatori
- Facilita la collaborazione in team internazionali
- Permette una migliore integrazione con librerie e framework esistenti
- Migliora la manutenibilità del codice nel lungo termine

Tuttavia, per questa applicazione:
- **Codice e variabili**: in inglese (standard internazionale)
- **Commenti**: in italiano per facilitare la comprensione accademica
- **Documentazione**: in italiano (questa relazione)
- **Interfaccia utente**: in italiano per il target di utenti italiani
- **Messaggi di errore**: in inglese lato server, in italiano lato client

Questa scelta bilanciata permette di mantenere gli standard professionali del codice garantendo al contempo l'accessibilità per il contesto accademico italiano.

---

**Fine Relazione Tecnica**

*Documento generato il 1 Febbraio 2026*  
*Progetto FastFood PMW - CodeBite v1.0.0*

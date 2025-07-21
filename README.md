## EJARALUX BACKEND

Luxury Skin, Timeless Glow

### Perequisites

- Download and install the latest version of NodeJS from: [Instructions & Guide](https://nodejs.org/en/download)
- Download PostgreSQL [Instructions & Guide](https://www.postgresql.org/download/)
- Download Redis [Instructions & Guide](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-windows/)

### Next Steps

- Check for your system specifications on how to start the `redis client` and `postgreSQL` locally.
- Create a postgreSQL database called `ejaralux`.
- You can use a tool like [TablePlus](https://tableplus.com/download/) to connect and visualize your database tables.

### How to Run

1. Clone this repository using the following command:

```bash
git clone https://github.com/NjohPrince/ejaralux-backend.git
```

2. Open cloned project folder on your code editor and install the project dependencies by running:

```bash
yarn install
```

3. Create a `.env.local` file and paste the content from `env.example` file located at the root of the project folder.

4. Start the debvelopment server as follows:

```bash
yarn start
```
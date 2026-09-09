import env from './env.js';

const parseDatabaseUrl = (databaseUrl) => {
  if (!databaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(databaseUrl);

    return {
      host: parsed.hostname || 'localhost',
      port: Number(parsed.port || 5432),
      user: decodeURIComponent(parsed.username || 'postgres'),
      password: decodeURIComponent(parsed.password || ''),
      database: parsed.pathname.replace(/^\/+/, '') || 'pooja_fashion',
      dialect: parsed.protocol === 'postgresql:' ? 'postgres' : 'mysql',
    };
  } catch {
    return null;
  }
};

const parsedDatabase = parseDatabaseUrl(env.DATABASE_URL);

const databaseConfig = {
  host: parsedDatabase?.host || 'localhost',
  port: parsedDatabase?.port || 5432,
  user: parsedDatabase?.user || 'postgres',
  password: parsedDatabase?.password || 'admin',
  database: parsedDatabase?.database || 'pooja_fashion',
  dialect: parsedDatabase?.dialect || 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export default databaseConfig;

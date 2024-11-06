# Nostra Pizza - Aplicación móvil y web

## Dependencias
* expo
* redux
* react-redux
* react-navigation
* react-native-paper 
* react-native-image-picker
* react-native-full-responsive

## Amazon Web Services
> En uso desde el 6 de Noviembre de 2024. Cuenta: 03.federico.gonzalez@gmail.com - federicogs03  
### Lambda
En Amazon Lambda están hosteadas las APIs que consume la aplicación.
### RDS
En Amazon RDS está hosteada la base de datos Postgres 16.4 que usa la aplicación con la siguiente estructura:

``` sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    is_guest BOOLEAN,
    google_id VARCHAR(100),
    created_at TIMESTAMPTZ
);

CREATE TABLE discounts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    discount NUMERIC(5,2),
    starts_at TIMESTAMP WITHOUT TIME ZONE,
    ends_at TIMESTAMP WITHOUT TIME ZONE,
    active BOOLEAN
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50),
    pay_method VARCHAR(50),
    delivery_address TEXT,
    total NUMERIC(10,2),
    created_at TIMESTAMPTZ
);

CREATE TABLE menu (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price NUMERIC(10,2),
    available BOOLEAN,
    image TEXT,
    created_at TIMESTAMPTZ
);

CREATE TABLE flavour_group (
    id SERIAL PRIMARY KEY,
    grp_title VARCHAR(256)
);

CREATE TABLE flavour (
    id SERIAL PRIMARY KEY,
    flavour_group_id INTEGER REFERENCES flavour_group(id),
    flavour_name VARCHAR(256),
    available BOOLEAN
);

CREATE TABLE menu_flavour_group (
    menu_id INTEGER REFERENCES menu(id),
    flavour_grp_id INTEGER REFERENCES flavour_group(id),
    max_quantity INTEGER,
    PRIMARY KEY (menu_id, flavour_grp_id)
);

CREATE TABLE order_discount (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    discount_id INTEGER REFERENCES discounts(id),
    applied NUMERIC(10,2),
    created_at TIMESTAMPTZ
);

CREATE TABLE order_details (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    menu_item_id INTEGER REFERENCES menu(id),
    quantity INTEGER,
    unit_price NUMERIC(10,2),
    total NUMERIC
);
```
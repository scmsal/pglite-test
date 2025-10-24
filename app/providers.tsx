"use client";

import { PGlite } from "@electric-sql/pglite";
import { live, PGliteWithLive } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { ReactNode, useState, useEffect } from "react";
import { Repl } from "@electric-sql/pglite-repl";
import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import { transactions } from "./schema";

const query = `
     CREATE TABLE IF NOT EXISTS transactions(
      id SERIAL PRIMARY KEY,
        date VARCHAR(50),
        arrival_date VARCHAR(50),
        type VARCHAR(50),
        confirmation_code VARCHAR(50),
        booking_date VARCHAR(50),
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        short_term VARCHAR(50),
        nights INTEGER,
        guest VARCHAR(255),
        listing VARCHAR(255),
        details TEXT,
        amount NUMERIC,
        paid_out NUMERIC,
        service_fee NUMERIC,
        fast_pay_fee NUMERIC,
        cleaning_fee NUMERIC,
        gross_earnings NUMERIC,
        total_occupancy_taxes NUMERIC,
        earnings_year INTEGER,
        county_tax NUMERIC,
        state_tax NUMERIC
      );
  `;

export default function Providers(props: { children: ReactNode }) {
  const [pgLite, setPgLite] = useState<PGliteWithLive>();
  const [db, setDb] = useState<PgliteDatabase>();

  useEffect(() => {
    const initDb = async () => {
      const pgLite = await PGlite.create({
        dataDir: "idb://rentalTaxesDB",
        extensions: { live },
      });
      await pgLite.exec(query);
      //instead of creating a new connection with
      //const db = drizzle({ connection: { dataDir: 'idb://rentalTaxesDB' }});
      //reuse the original pgLite instance:
      const db = drizzle(pgLite);
      setPgLite(pgLite);
      setDb(db);
    };

    initDb();
  }, []);

  if (!db) {
    return <div>Loading database...</div>;
  }

  async function handleAdd() {
    await db?.insert(transactions).values({
      date: "2022-01-01",
      arrivalDate: "2022-01-02",
      type: "hotel",
      confirmationCode: "CONF123",
      bookingDate: "2022-01-01",
      startDate: "2022-01-01",
      endDate: "2022-01-02",
      shortTerm: "yes",
      nights: 1,
      guest: "Jane Doe",
      listing: "Hotel XYZ",
      details: "Test booking",
      amount: 100,
      paidOut: 90,
      serviceFee: 10,
      fastPayFee: 5,
      cleaningFee: 5,
      grossEarnings: 100,
      totalOccupancyTaxes: 10,
      earningsYear: 2022,
      countyTax: 5,
      stateTax: 5,
    });
  }

  async function handleLog() {
    const result = await db?.select().from(transactions);
    console.log("result", result);
  }

  return (
    <PGliteProvider db={pgLite}>
      <Repl pg={pgLite} />
      <button onClick={handleAdd}>Add Transaction</button>
      <button onClick={handleLog}>Log Transactions</button>
      {props.children}
    </PGliteProvider>
  );
}

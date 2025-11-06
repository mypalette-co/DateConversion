import express from "express";
import { DateTime } from "luxon";

const app = express();
app.use(express.json());

// POST /parse
// body: { "date": "11/02/2019", "input_format": "MM/dd/yyyy", "zone": "UTC" }
app.post("/parse", (req, res) => {
  const { date, input_format = "MM/dd/yyyy", zone = "UTC" } = req.body || {};
  if (!date) return res.status(400).json({ ok: false, error: "Missing 'date'." });

  const dt = DateTime.fromFormat(date, input_format, { zone });
  if (!dt.isValid) return res.status(422).json({ ok: false, error: dt.invalidExplanation });

  // Bubble-friendly ISO 8601 (what the API Connector likes)
  const iso = dt.toUTC().toISO();               // "2019-11-02T00:00:00.000Z"
  const isoDateOnly = dt.toFormat("yyyy-LL-dd"); // "2019-11-02"

  return res.json({
    ok: true,
    input: { date, input_format, zone },
    parsed: {
      iso,                    // best for Bubble "date" fields via API Connector
      iso_date_only: isoDateOnly,
      unix_ms: dt.toMillis()
    }
  });
});

// Simple health check
app.get("/", (_, res) => res.send("OK"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

import React from "react";
import { useState, useEffect } from "react";
import { api } from "../App";

function AllStations() {
  const [stations, setStations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/Station`)
      .then((response) => console.log(response))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h3>Laden...</h3>;
  return (
    <div>
      Alle stations
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">id</th>
            <th scope="col">Naam</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td></td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default AllStations;

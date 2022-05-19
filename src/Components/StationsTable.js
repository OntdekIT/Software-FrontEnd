import React from "react";
import axios from "../api/axios";
import { useState, useEffect } from "react";

function AllStations() {
  const [stations, setStations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8082/api/Station`)
      .then((response) => console.log(response))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h3>Loading...</h3>;
  return (
    <div>
      AllStations
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">id</th>
            <th scope="col">Name</th>
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

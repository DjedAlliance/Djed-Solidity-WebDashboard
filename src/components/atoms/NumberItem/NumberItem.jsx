import React from "react";
import "./_NumberItem.scss";

const NumberItem = ({ amount, label }) => (
  <div className="NumberItem">
    <p className="Label">{label}</p>
    <h4 className="Amount">{amount}</h4>
  </div>
);

export default NumberItem;

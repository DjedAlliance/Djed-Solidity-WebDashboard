import React from "react";
import "./_LabelMessage.scss";

const LabelMessage = ({ labelIcon, labelTitle, labelText }) => (
  <div className="LabelMessage">
    <img className="LabelIcon" src={labelIcon} alt="" />
    <div className="LabelMessageText">
      <h3 className="LabelTitle">{labelTitle}</h3>
      <p className="LabelText">{labelText}</p>
    </div>
  </div>
);

export default LabelMessage;

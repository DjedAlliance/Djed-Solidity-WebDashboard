import React, { useState } from "react";
import { Modal } from "antd";

import "./_ModalTransaction.scss";
import { Link } from "react-router-dom";

const ModalTransaction = ({ transactionStatus, statusText, statusDescription }) => {
  const [visible, setVisible] = useState(true);

  return (
    <Modal
      className="CustomModal"
      visible={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      footer={[
        <Link to="/my-balance">
          Check your balance <img src="/arrow-right.svg" alt="" />
        </Link>
      ]}
    >
      <img className="ModalImg" src={transactionStatus} alt="" />
      <h3>{statusText}</h3>
      <p>{statusDescription}</p>
    </Modal>
  );
};

export default ModalTransaction;

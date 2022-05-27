import React, { useState } from "react";
import { Modal, Button } from "antd";

import "./_ModalTransaction.scss";

const ModalTransaction = ({ transactionStatus, statusText, statusDescription }) => {
  const [visible, setVisible] = useState(true);

  return (
    <Modal
      className="CustomModal"
      visible={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      footer={[
        <Button type="link">
          Check your balance <img src="/arrow-right.svg" alt="" />
        </Button>
      ]}
    >
      <img className="ModalImg" src={transactionStatus} alt="" />
      <h3>{statusText}</h3>
      <p>{statusDescription}</p>
    </Modal>
  );
};

export default ModalTransaction;

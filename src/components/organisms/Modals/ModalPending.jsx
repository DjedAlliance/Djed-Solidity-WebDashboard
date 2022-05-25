import React, { useState } from "react";
import { Modal, Button } from "antd";

import "./_ModalTransaction.scss";
import LabelMessage from "../../atoms/LabelMessage/LabelMessage";
import LoadingIcon from "../../atoms/LoadingIcon/LoadingIcon";

const ModalPending = ({
  transactionStatus,
  statusText,
  statusDescription,
  transactionType
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>{transactionType}</Button>
      <Modal
        className="CustomModal"
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <LoadingIcon />
        <h3>{statusText}</h3>
        <p>{statusDescription}</p>
        <LabelMessage
          labelIcon="/warning-icon.svg"
          labelTitle="Warning!"
          labelText="Do not close this page or the transaction will fail."
        />
      </Modal>
    </>
  );
};

export default ModalPending;

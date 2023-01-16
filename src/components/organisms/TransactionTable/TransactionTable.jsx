import React from "react";
import { Table, Tag } from "antd";

import "./_TransactionTable.scss";

const columns = [
  {
    title: "Transaction ID",
    dataIndex: "transactionId",
    key: "transactionId",
    ellipsis: true
  },
  {
    title: "Transaction",
    dataIndex: "transaction",
    key: "transaction",
    render: (text) => (
      <p>
        <img src="/caret-up.svg" alt="" /> <img src="/caret-down.svg" alt="" /> {text}
      </p>
    )
  },
  {
    title: "Total",
    dataIndex: "total",
    key: "total",
    render: (text) => (
      <p className="Total">
        {text} <span>mADA</span>
      </p>
    )
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date"
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: () => (
      <div>
        <Tag color="#3FCB97">COMPLETED</Tag>
        <Tag color="#F7981C">PENDING</Tag>
        <Tag color="#F2316A">FAILED</Tag>
      </div>
    )
  },
  {
    title: "",
    key: "action",
    width: 40,
    render: () => ({
      /*<a href="">
        <img src="/external-link.svg" alt="" />
    </a>*/
    })
  }
];

const data = [
  {
    key: "1",
    transactionId: "7680adec8eabcabac676be9e83854ade0bd22cdb",
    transaction: "Stablecoin",
    total: "+0.005456",
    date: "12/04/21 09:31:06 EST"
  },
  {
    key: "2",
    transactionId: "7680adec8eabcabac676be9e83854ade0bd22abc",
    transaction: "Reservecoin",
    total: "+0.005456",
    date: "12/04/21 09:31:06 EST"
  },
  {
    key: "3",
    transactionId: "7680adec8eabcabac676be9e83854ade0bd22mnb",
    transaction: "mADA",
    total: "+0.005456",
    date: "12/04/21 09:31:06 EST"
  }
];

const TransactionTable = () => (
  <div className="TransactionTable">
    <h3>LAST TRANSACTIONS</h3>
    <Table
      columns={columns}
      dataSource={data}
      size="middle"
      pagination={false}
      scroll={{ x: 1000 }}
    />
  </div>
);
export default TransactionTable;

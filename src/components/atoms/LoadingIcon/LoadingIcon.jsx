import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./_LoadingIcon.scss";

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

const LoadingIcon = ({ coinIcon, coinName }) => (
  <div className="LoadingIcon">
    <Spin indicator={antIcon} size="large" />
  </div>
);

export default LoadingIcon;

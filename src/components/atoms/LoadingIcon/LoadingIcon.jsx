import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./_LoadingIcon.scss";

const LoadingIcon = ({ coinIcon, coinName, size = 50 }) => (
  <div className="LoadingIcon">
    <Spin indicator={<LoadingOutlined style={{ fontSize: size }} spin />} size="large" />
  </div>
);

export const FullPageSpinner = () => {
  return (
    <div className="LoadingIcon-fullpage">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} size="large" />
    </div>
  );
};

export default LoadingIcon;

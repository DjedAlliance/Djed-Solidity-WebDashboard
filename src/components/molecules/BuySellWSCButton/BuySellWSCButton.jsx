import React, { useEffect } from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Modal, Steps } from "antd";

const capitalizeString = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};
const { Step } = Steps;

const Step1Content = () => {
  return <div>Step 1 Content</div>;
};
const Step2Content = () => {
  return <div>Step 2 Content</div>;
};
const Step3Content = () => {
  return <div>Step 3 Content</div>;
};

const BuySellWSCButton = ({
  onClick,
  buyOrSell,
  currencyName,
  disabled,
  activeConnector
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);

  const [wscProvider, setWscProvider] = React.useState(null);

  const showModal = () => {
    console.log("test!");
    setIsModalOpen(true);
  };

  const handleNextStep = () => {
    const nextStepIdx = currentStep + 1;
    setCurrentStep(nextStepIdx);
  };
  const handlePrevStep = () => {
    const prevStepIdx = currentStep - 1;
    setCurrentStep(prevStepIdx);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const loadWscProvider = async () => {
      try {
        const provider = await activeConnector.getProvider();
        if (!provider) return;
        setWscProvider(provider);
      } catch (e) {
        console.log(e);
      }
    };
    loadWscProvider();
  }, [activeConnector]);

  return (
    <>
      <CustomButton
        text={`${capitalizeString(buyOrSell)} ${currencyName}`}
        variant="primary"
        icon={<ArrowRightOutlined />}
        onClick={showModal}
        disabled={disabled}
      />

      <Modal
        title="Wrapped Smart Contract"
        visible={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <button key="back" onClick={handlePrevStep} disabled={currentStep === 0}>
            Prev
          </button>,
          <button
            key="submit"
            type="primary"
            disabled={currentStep === 2}
            loading={false}
            onClick={handleNextStep}
          >
            Next
          </button>
        ]}
      >
        <Steps current={currentStep}>
          <Step title="Step 1 Title" />
          <Step title="Step 2 Title" subTitle="Step 2 Subtitle" />
          <Step title="Step 3 Title" />
        </Steps>
        {currentStep === 0 && <Step1Content />}
        {currentStep === 1 && <Step2Content />}
        {currentStep === 2 && <Step3Content />}
      </Modal>
    </>
  );
};

export default BuySellWSCButton;

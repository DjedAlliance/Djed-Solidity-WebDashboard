import React from "react";
import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import styles from "./KYAModal.module.scss";

const KYA_CONTENT = {
    title: "Know Your Assumptions",
    intro: "This decentralized application is composed of smart contracts running on a blockchain and a website that eases your interaction with the smart contracts.",
    developer: "The smart contracts and the website were developed by The Stable Order, an organization dedicated to making the world more stable.",
    sourceCode: {
        text: "The source code of the smart contracts and of the website can be found in",
        link: "https://github.com/StabilityNexus",
        linkText: "https://github.com/StabilityNexus"
    },
    recommendation: "We strongly recommend that you do your own research and inspect the source code of any blockchain application that you wish to interact with. The source code is the only source of truth about the applications that you use.",
    pleaseNote: [
        "When you interact with any smart contract on any blockchain through any application, your transactions are recorded anonymously forever on the blockchain.",
        "Transactions are final and irreversible once they are confirmed on the blockchain.",
        "The smart contracts made by The Stable Order are immutable and autonomous.",
        "No one can change or update the smart contracts deployed on the blockchain.",
        "The smart contracts are executed autonomously by the blockchain's block validators.",
        "The websites made by The Stable Order are lean static serverless frontends.",
        "They do not collect your data on any server.",
        "They rely solely on data available publicly on blockchains or on data stored locally in your own device.",
        "You may run the websites locally in your own computer. So, even if, for any reason, the websites deployed in our own domains become unavailable, you can still interact with the smart contracts.",
        "Some of our projects may depend on external infrastructure, such as oracles and blockchain explorers."
    ],
    risks: [
        "You may lose your wallet password, recovery phrases or private keys, thereby losing access to your assets.",
        "Hackers may succeed in obtaining your wallet password, recovery phrases or private keys, thereby gaining access to your assets.",
        "The blockchain may become congested or unavailable, resulting in delays in the confirmation of your transactions.",
        "If you are interacting with a centralized blockchain (a.k.a. \"L2\", \"sidechain\", \"Proof-of-Authority blockchain\", ...), the block validators may decide to stop operating the blockchain.",
        "The external infrastructure on which a decentralized application depends may experience issues or become unavailable.",
        "Oracles, in particular, may suffer delays or manipulations.",
        "The source code of the smart contracts and the website may contain bugs that may cause the application to behave unexpectedly and unfavourably.",
        "The algorithms and protocols implemented by the code may have unforeseen behaviors."
    ],
    disclaimer: "While we do our best to ensure that we implement good algorithms and protocols, that the implementations are free from bugs, and that the deployed applications are fully or minimally dependent on external infrastructure, you use the applications at your own risk. You are solely responsible for your assets. You are solely responsible for the security of your wallet (and its password, recovery phrase and private keys). The Stable Order does not operate any blockchain, server or external infrastructure on which the application depends, and hence The Stable Order is not responsible for their operation.",
    warning: "We will never ask for your password, recovery phrase or private keys. Anyone asking this information from you is almost certainly a scammer.",
    noSupport: "We do not provide support of any kind. We do research and development. Uses of the algorithms, protocols, smart contracts, websites and applications that result from our research and development are at your own risk.",
    agreement: "By using this application, you confirm that you understand and agree with everything stated above and with our detailed Terms and Conditions."
};

export default function KYAModal({ visible, onClose, onAccept }) {
    const handleAccept = () => {
        onAccept();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            closeIcon={<CloseOutlined className={styles.closeIcon} />}
            className={styles.kyaModal}
            centered
        >
            <div className={styles.modalContent}>
                <h2 className={styles.title}>{KYA_CONTENT.title}</h2>

                <div className={styles.scrollableContent}>
                    <p>{KYA_CONTENT.intro}</p>
                    <p>{KYA_CONTENT.developer}</p>

                    <p>
                        {KYA_CONTENT.sourceCode.text}{" "}
                        <a
                            href={KYA_CONTENT.sourceCode.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            {KYA_CONTENT.sourceCode.linkText}
                        </a>.
                    </p>

                    <p>{KYA_CONTENT.recommendation}</p>

                    <h3 className={styles.subtitle}>Please note:</h3>
                    <ul className={styles.list}>
                        {KYA_CONTENT.pleaseNote.map((item, index) => (
                            <li key={`note-${index}`}>{item}</li>
                        ))}
                    </ul>

                    <p>Interacting with blockchain applications may involve risks such as the following (non-exhaustively):</p>

                    <ul className={styles.list}>
                        {KYA_CONTENT.risks.map((risk, index) => (
                            <li key={`risk-${index}`}>{risk}</li>
                        ))}
                    </ul>

                    <p>{KYA_CONTENT.disclaimer}</p>

                    <p className={styles.warning}>{KYA_CONTENT.warning}</p>

                    <p>{KYA_CONTENT.noSupport}</p>

                    <p className={styles.agreement}>{KYA_CONTENT.agreement}</p>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.acceptButton}
                        onClick={handleAccept}
                    >
                        I understand and I agree
                    </button>
                </div>
            </div>
        </Modal>
    );
}

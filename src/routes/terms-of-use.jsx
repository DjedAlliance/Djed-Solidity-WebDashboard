import React, { useState, useEffect } from "react";

const TermsOfUse = () => {
  const [Terms, setTerms] = useState(null);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const termsPath = `./${
          process.env.REACT_APP_TERMS_OF_USE || "terms-of-use-default"
        }`;
        const module = await import(`${termsPath}`);
        setTerms(() => module.default);
      } catch (error) {
        console.error("Failed to load the terms:", error);
      }
    };
    loadTerms();
  }, []);

  if (!Terms) {
    return <div>Loading...</div>;
  }

  return <Terms />;
};

export default TermsOfUse;

import React from "react";
import { ValidationIssue } from "../types";

interface Props {
  issues: ValidationIssue[];
}

const ValidationPanel: React.FC<Props> = ({ issues }) => {
  if (!issues.length) {
    return <div className="badge">Schema validation: OK</div>;
  }

  return (
    <div className="panel validation-panel">
      <h3>Validation</h3>
      <ul className="validation-list">
        {issues.map((issue, idx) => (
          <li key={idx} className="validation-item">
            <span className="validation-path">{issue.instancePath || "/"}</span>{" "}
            — {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationPanel;

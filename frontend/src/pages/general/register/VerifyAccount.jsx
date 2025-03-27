import { useState } from "react";
import { Button, Card, CardContent, TextField } from "@mui/material";
import contactbag from '../../../assets/images/contactbag.jpg';
import "./VerifyAccount.modules.css"


export default function VerifyAccount() {
  const [code, setCode] = useState("");

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleVerify = () => {
    navigate("/")
  };

  const handleResend = () => {
    // Handle resend code process
  };

  return (
    <div className="verify-page" style={{ backgroundImage: `url(${contactbag})` }}>
    <div className="flex flex-col items-center justify-center h-screen ">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-slate-800 text-center">
            Welcome to Jockalois Inn Enterprise
          </h1>
          <p className="text-lg text-slate-600 text-center mt-2">
            Please Verify Your Identity
          </p>
          <p className="text-sm text-gray-500 text-center mt-1">
            A six-digit code has been sent to your email address. Enter the code
            and continue to the website.
          </p>

          <TextField
            value={code}
            onChange={handleCodeChange}
            placeholder="Enter 6-digit code"
            variant="outlined"
            className="mt-6 w-full"
            inputProps={{ maxLength: 6, style: { textAlign: "center" } }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleVerify}
            className="mt-4 w-full"
          >
            Verify
          </Button>

          <Button
            variant="text"
            onClick={handleResend}
            className="mt-2 text-blue-700"
          >
            Send Again
          </Button>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}

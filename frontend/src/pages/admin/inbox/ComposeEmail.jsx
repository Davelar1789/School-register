import { MdClose, MdDelete } from "react-icons/md";
import { IoMdAttach } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const ComposeEmail = ({ handleOnClick, email }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sending, setSending] = useState(false);
  const inputStyles =
    "pl-2 text-slate-500 rounded-lg py-3 border-[2px] border-slate-300 outline-slate-200 hover:border-slate-200 hover:shadow-lg transition duration-500 ease-in-out ";

  const [emailData, setEmailData] = useState({
    to: email || "",
    subject: "",
    body: "",
    attachments: [],
  });

  const handleChange = (e) => {
    const { id, value } = e.target;

    setEmailData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    setSending(true);
    e.preventDefault();
    await axios
      .post("/api/sendEmail", emailData, { withCredentials: true })
      .then(() => {
        toast.success("Email sent");
        handleOnClick();
        setSending(false);
        if (location.pathname !== "/admin/contact") {
          navigate(0);
        }
      })
      .catch((err) => {
        // console.log(err);
        setSending(false);
        toast.error(err.response.data.message);
      });
  };

  return (
    <div className="flex flex-col flex-1 h-full px-6 ">
      <div className="flex justify-between bg-slate-100 px-4">
        <p>New Message</p>
        <button
          onClick={() => {
            // Functionality to save to draft
            handleOnClick();
          }}
        >
          <MdClose size={24} />
        </button>
      </div>
      <form className="flex flex-col gap-2">
        <input
          required
          placeholder="To"
          value={emailData.to}
          className={`${inputStyles} mt-4`}
          type="text"
          id="to"
          onChange={handleChange}
        />
        <input
          required
          value={emailData.subject}
          placeholder="Subject"
          className={`${inputStyles}`}
          type="text"
          id="subject"
          onChange={handleChange}
        />
        <textarea
          required
          value={emailData.body}
          placeholder="Body"
          className={`${inputStyles} h-40 max-h-40 min-h-40`}
          id="body"
          onChange={handleChange}
        />
      </form>
      <div className="px-4 bg-slate-100 flex justify-between items-center py-2 mt-auto">
        <button
          onClick={handleSubmit}
          type="submit"
          className="flex gap-2 items-center bg-blue-700 py-1 px-4 rounded-lg text-white"
        >
          {!sending ? "Send" : "Sending"} <IoSend size={15} />
        </button>
        <div className="flex gap-1">
          <label className="cursor-pointer">
            <IoMdAttach size={24} />
            <input type="file" className="hidden" />
          </label>
          <button onClick={handleOnClick}>
            <MdDelete size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;

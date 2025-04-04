import { Box } from "@mui/system";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from "react";

const Signup = () => {
    const [firstname, setfirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const auth = getAuth();
    return (
        <Box>

        </Box>
    )
}

export default Signup;
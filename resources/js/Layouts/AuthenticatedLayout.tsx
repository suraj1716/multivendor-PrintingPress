import ApplicationLogo from "@/Components/App/ApplicationLogo";
import Footer from "@/Components/App/Footer";
import Navbar from "@/Components/App/Navbar";
import Dropdown from "@/Components/Core/Dropdown";
import NavLink from "@/Components/Core/NavLink";
import ResponsiveNavLink from "@/Components/Core/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";



export default function AuthenticatedLayout({
  header,
  children,
}: PropsWithChildren<{ header?: ReactNode }>) {
  const props = usePage().props;
  const user = props.auth.user;

  const [successMessages, setSuccessMessages] = useState<any[]>([]);
  const timeoutRefs = useRef<{ [Key: number]: ReturnType<typeof setTimeout> }>(
    {}
  );
  const [showingNavigationDropdown, setShowingNavigationDropdown] =
    useState(false);

  useEffect(() => {
    if (props.success.message) {
      const newMessage = {
        ...props.success,
        id: props.success.time,
      };

      setSuccessMessages((prevMessages) => [newMessage, ...prevMessages]);

      const timeoutId = setTimeout(() => {
        setSuccessMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id != newMessage.id)
        );
        delete timeoutRefs.current[newMessage.id];
      }, 5000);

      timeoutRefs.current[newMessage.id] = timeoutId;
    }
  }, [props.success]);

  return (
    <div className=" min-h-screen bg-gray-100 z-200">
      <Navbar/>
      {props.error && (
        <div className="container px-8 mt-8 mx-auto">
          <div className="alert alert-error">{props.error}</div>
        </div>
      )}

      {successMessages.length > 0 && (
        <div className="toast toast-top toast-end z-[1000] mt-16">
          {successMessages.map((msg) => (
            <div className="alert laert-success" key={msg.id}>
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
      )}

      <main>{children}</main>
         <Footer/>
    </div>
  );
}

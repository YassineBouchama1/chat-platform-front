import ProfileHeader from "./ProfileHeader";
import MessageBody from "./MessageBody";
import MessageFooter from "./MessageFooter";

export default function MessageComponent() {
  return (
    <div className="w-screen h-screen">
      <ProfileHeader />
      <MessageBody />
      <MessageFooter />
    </div>
  );
}

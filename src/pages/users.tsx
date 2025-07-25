import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";

function Users() {
  const { data, isPending, refetch, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (error) {
    alert("something went wrong");
  }

  return (
    <>
      <Button onClick={() => refetch()}>Refetch</Button>
      <h1>{isPending ? <Spinner /> : JSON.stringify(data)}</h1>
    </>
  );
}

async function getUsers() {
  const resp = await fetch("http://localhost:5000/api/users");
  return resp.json();
}

export default Users;

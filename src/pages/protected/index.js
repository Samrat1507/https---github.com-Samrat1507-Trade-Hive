import React, { useEffect, useState } from "react";
import ProtectedNav from "../../../components/ProtectedNav";
import ProtectedSidebar from "../../../components/ProtectedSidebar";
import { clerkClient, getAuth, buildClerkProps } from "@clerk/nextjs/server";
import Link from "next/link";
import { useSnapshot } from "valtio";
import state from "../state";
import { MdOutlineAddCard } from "react-icons/md";
import PortfolioHoldings from "../../../components/PortfolioHoldings";

const Protected = (props) => {
  const userEmail = props.__clerk_ssr_state.user.emailAddresses[0].emailAddress;
  const snap = useSnapshot(state);
  useEffect(() => {
    const fun = async () => {
      const response = await fetch(
        "http://localhost:3000/api/mongoDB/putUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
    };
    fun();
  }, []);

  useEffect(() => {
    const getUserDetails = async () => {
      const response = await fetch(
        "http://localhost:3000/api/mongoDB/fetchUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
          }),
        }
      );
      const data = await response.json();
      state.user = data;
    };
    getUserDetails();
  }, []);

  return (
    <div className="primary-bg h-screen">
      <ProtectedNav />
      <ProtectedSidebar active="Your Holdings" />
      <div
        className={`${
          state.sidebar ? "md:pl-[32vw] xl:pl-[30vw]" : "md:pl-[5vw]"
        } pl-5 mt-10`}
      >
        <div className="portfolio-bg rounded-xl px-10 py-5 mr-5 drop-shadow-md">
          <div className="flex justify-between">
            <div className="py-5">
              <h2 className="text-accent font-medium">Your Net Profit</h2>
              <span className="text-[#FBF5A5] md:text-5xl text-xl font-semibold">
                Rs. 43,300.50
              </span>
            </div>
            <div className="py-5">
              <h2 className="text-accent font-medium">Account Balance</h2>
              {state.user ? (
                <div className="flex items-center gap-4 cursor-pointer">
                <span className="text-[#9DE796] md:text-5xl text-xl font-semibold">
                  {state.user.credits} creds
                </span>
                <div className="text-[#9DE796] md:mt-2 mt-1 md:text-xl text-sm">
                <MdOutlineAddCard />
                </div>
                </div>
              ) : (
                <span>
                  <MdOutlineAddCard />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className='mt-20 pr-5'>
          <div className='h-fit widgets w-fit md:min-w-[35vw] min-w-full flex flex-col gap-5 pr-10 pl-4 rounded-xl py-5'>
            <h2 className='text-2xl text-accent font-medium'>Current Holdings</h2>
            <div>
              <div className='flex gap-10 text-accent'>
                <span className="font-medium">Company</span>
                <span className="font-medium">Quantity</span>
                <span className="font-medium">Current Price</span>
              </div>
              <div className='w-full h-[1px] bg-secondary mt-2'>
              </div>

              <div className='mt-4'>
                {
                  state.user.holdings ? (
                    <PortfolioHoldings holdings={state.user.holdings}/>
                  ) : (<span className='text-accent'>No Holdings were Found</span>)
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) {
    return;
  }
  const user = userId ? await clerkClient.users.getUser(userId) : undefined;

  return { props: { ...buildClerkProps(ctx.req, { user }) } };
};
export default Protected;

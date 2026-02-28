"use client"

import { Hash, Shield, Zap, Globe } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Hash className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Welcome to dChat
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          Peer-to-peer encrypted messaging for the decentralized web. Select a
          conversation to start chatting.
        </p>

        <div className="grid w-full gap-3">
          {[
            {
              icon: Shield,
              title: "End-to-End Encrypted",
              desc: "All messages are encrypted by default using your wallet keys",
            },
            {
              icon: Zap,
              title: "Peer-to-Peer",
              desc: "No central servers. Messages are relayed through the network",
            },
            {
              icon: Globe,
              title: "Cross-Chain",
              desc: "Message anyone on any supported chain with their wallet address",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

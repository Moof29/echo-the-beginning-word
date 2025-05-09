
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, ExternalLink, Link2, Unlink, RefreshCw } from 'lucide-react';

interface ConnectionDetails {
  companyName: string;
  companyId: string;
  connectedAt: Date;
  expiresAt: Date;
}

interface QBOConnectionStatusProps {
  isConnected: boolean;
  connectionDetails: ConnectionDetails | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshToken?: () => void; // NEW
  tokenExpiresAt?: Date | null;
  isRefreshingToken?: boolean;
}

function getExpiryStatus(expiresAt?: Date | null) {
  if (!expiresAt) return null;
  const ms = expiresAt.getTime() - Date.now();
  const hoursLeft = ms / (1000 * 60 * 60);
  if (ms <= 0) return { msg: "Token expired", color: "text-red-600", urgent: true };
  if (hoursLeft < 48) return { msg: `Expires soon (${Math.round(hoursLeft)}h left)`, color: "text-amber-600", urgent: true };
  return { msg: `Expires in ${Math.round(hoursLeft)}h`, color: "text-green-700", urgent: false };
}

export const QBOConnectionStatus: React.FC<QBOConnectionStatusProps> = ({ 
  isConnected, 
  connectionDetails, 
  onConnect, 
  onDisconnect,
  onRefreshToken,
  tokenExpiresAt,
  isRefreshingToken,
}) => {
  const expiryStatus = getExpiryStatus(tokenExpiresAt);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              {isConnected ? (
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="bg-amber-100 p-3 rounded-full">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">QuickBooks Online</h3>
                {isConnected ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Connected</Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100">
                    Not Connected
                  </Badge>
                )}
              </div>
              
              {isConnected && connectionDetails ? (
                <div className="text-sm text-muted-foreground">
                  <p>
                    Connected to <span className="font-medium">{connectionDetails.companyName}</span>
                  </p>
                  <p className="text-xs mt-1">
                    Connected {new Date(connectionDetails.connectedAt).toLocaleDateString()} {" · "}
                    Token expires {new Date(connectionDetails.expiresAt).toLocaleDateString()}
                  </p>
                  {tokenExpiresAt && expiryStatus?.msg && (
                    <div className={`mt-1 text-xs font-medium flex items-center gap-1 ${expiryStatus.color}`}>
                      <RefreshCw className="inline h-4 w-4" />
                      {expiryStatus.msg}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Connect your QuickBooks account to sync financial data
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={onDisconnect}
                >
                  <Unlink className="h-4 w-4" />
                  Disconnect
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={onConnect}
                >
                  <ExternalLink className="h-4 w-4" />
                  Reconnect
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  aria-label="Refresh QBO token"
                  onClick={() => onRefreshToken && onRefreshToken()}
                  disabled={isRefreshingToken}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshingToken ? 'animate-spin' : ''}`} />
                  {isRefreshingToken ? "Refreshing..." : "Refresh Token"}
                </Button>
              </>
            ) : (
              <Button
                className="flex items-center gap-2"
                onClick={onConnect}
              >
                <Link2 className="h-4 w-4" />
                Connect to QuickBooks
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

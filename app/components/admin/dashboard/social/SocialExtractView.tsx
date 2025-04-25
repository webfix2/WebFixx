import React from 'react';
import { parseJSONWithComments } from '../../../../../utils/helpers';
import { SocialExtract } from '../../../../types/extracts';

interface SocialExtractViewProps {
  data: string;
}

export const SocialExtractView = ({ data }: SocialExtractViewProps) => {
  try {
    // Handle both string and parsed data formats
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        parsedData = parseJSONWithComments(data);
      }
    } else {
      parsedData = data;
    }

    if (!parsedData || !Array.isArray(parsedData)) {
      console.error('Invalid social extract data format:', parsedData);
      return <div>Invalid data format</div>;
    }

    return (
      <div className="space-y-6">
        {parsedData.map((account, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {account.platform}
                <span className="text-sm text-gray-500 ml-2">({account.username})</span>
              </h3>
              <span className={`px-2 py-1 rounded-full text-sm ${
                account.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {account.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Last Used</p>
                <p className="font-medium">{new Date(account.lastUsed).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IP Address</p>
                <p className="font-medium">{account.ipAddress}</p>
              </div>
            </div>

            {account.device && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Device Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Browser:</span> {account.device.browser}</p>
                  <p><span className="text-gray-500">OS:</span> {account.device.os}</p>
                </div>
              </div>
            )}

            {account.extractedDetails && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Followers</p>
                    <p className="font-medium">{account.extractedDetails.followersCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Following</p>
                    <p className="font-medium">{account.extractedDetails.followingCount}</p>
                  </div>
                </div>

                {account.extractedDetails.recentActivity && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      {account.extractedDetails.recentActivity.map((activity: any, aIndex: number) => (
                        <div key={aIndex} className="bg-gray-50 p-2 rounded text-sm">
                          <p>{activity.type} on {activity.on}</p>
                          {activity.text && <p className="text-gray-600 mt-1">{activity.text}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {account.extractedDetails.followers && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Top Followers</h4>
                    <div className="space-y-3">
                      {account.extractedDetails.followers.slice(0, 3).map((follower: any, fIndex: number) => (
                        <div key={fIndex} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{follower.fullName}</p>
                              <p className="text-sm text-gray-500">@{follower.username}</p>
                            </div>
                            {follower.isFollowingYou && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Follows you
                              </span>
                            )}
                          </div>
                          {follower.relationshipSummary && (
                            <p className="text-sm text-gray-600 mt-2">{follower.relationshipSummary}</p>
                          )}
                          <div className="mt-2 text-sm">
                            <p><span className="text-gray-500">Email:</span> {follower.email}</p>
                            <p><span className="text-gray-500">Phone:</span> {follower.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return <div>Error parsing data</div>;
  }
};
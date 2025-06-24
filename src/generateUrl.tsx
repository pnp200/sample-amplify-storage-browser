import { S3, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { ActionHandler } from '@aws-amplify/ui-react-storage/browser';

type GenerateLink = ActionHandler<
  { duration: number; fileKey: string },
  { link: string }
>;

export const generateUrlHandler: GenerateLink = ({ data, config }) => {
  const handleGenerateUrl = async () => {
    try {
      const s3 = new S3({
        region: config.region,
        credentials: (await config.credentials()).credentials,
      });
      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: data.key,
      });
      const url = await getSignedUrl(s3, command, {
        expiresIn: data.duration * 60,
      });
      const result = {
        status: 'COMPLETE' as const,
        value: { link: url },
      };
      return result;
    } catch (error) {
      const message = 'Unable to generate link';
      return {
        status: 'FAILED' as const,
        message,
        error,
      };
    }
  };

  return { result: handleGenerateUrl() };
};

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/components/primitives';
import { cn } from '@/lib/utils';

interface AuthSupportActionProps {
  visible?: boolean;
  containerClassName?: string;
  buttonClassName?: string;
  usernameClassName?: string;
}

export function AuthSupportAction({
  visible = true,
  containerClassName,
  buttonClassName,
  usernameClassName,
}: AuthSupportActionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!visible) {
    return null;
  }

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <Button
        type="button"
        variant="secondary"
        size="md"
        fullWidth
        className={buttonClassName}
        onClick={() => navigate('/support/guest')}
      >
        {t('support.contactUs', { defaultValue: 'Связаться с поддержкой' })}
      </Button>
      <p className={cn('text-center text-xs text-dark-500', usernameClassName)}>
        Без регистрации, ответ появится в онлайн-чате
      </p>
    </div>
  );
}

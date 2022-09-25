import scrollIntoView from 'scroll-into-view-if-needed';
import { NavigateEvent } from './navigation';
import { getLink, getNavigationType, getPathId, shouldNotIntercept, updateTheDOMSomehow, wait } from './utils';

async function getFragment(toPath: string): Promise<string> {
  const response = await fetch(`/fragments${toPath}`);
  const data = await response.text();

  return data;
}

navigation.addEventListener('navigate', (navigateEvent: NavigateEvent) => {
  if (shouldNotIntercept(navigateEvent)) return;

  const toUrl = new URL(navigateEvent.destination.url);
  const toPath = toUrl.pathname;
  const fromPath = location.pathname;
  const navigationType = getNavigationType(fromPath, toPath);

  if (location.origin !== toUrl.origin) return;

  switch (navigationType) {
    case 'home-to-product':
      handleHomeToProductTransition(navigateEvent, toPath);
      break;
    case 'product-to-home':
      handleProductToHomeTransition(navigateEvent, toPath, fromPath);
      break;
    default:
      return;
  }
});

function handleHomeToProductTransition(navigateEvent: NavigateEvent, toPath: string) {
  const handler = async () => {
    if (!document.createDocumentTransition) {
      const data = await getFragment(toPath);
      updateTheDOMSomehow(data);
      return;
    }

    return new Promise<void>(async (resolve) => {
      const transition: DocumentTransition = document.createDocumentTransition();
      const link = getLink(toPath);
      if (!link) {
        return;
      }

      const image = link.querySelector('.product__img');
      const background = link.querySelector('.product__bg');
      let hasShownTemplate = false;
      let htmlFragment: string | null = null;

      if (image && background) {
        image.classList.add('product-image');
        background.classList.add('product-bg');
      }

      getFragment(toPath).then((data) => {
        // If we've shown a template and we are still on the same path,
        // update the dom with the real data.
        if (hasShownTemplate && location.pathname === toPath) {
          updateTheDOMSomehow(data);
          resolve();
        } else {
          htmlFragment = data;
        }
      });

      // Grace period to make an instant transition
      await wait(200);

      return transition.start(() => {
        if (image && background) {
          image.classList.remove('product-image');
          background.classList.remove('product-bg');
        }

        const template = document.getElementById('product-template-' + getPathId(toPath));

        if (htmlFragment !== null) {
          // If the data has loaded by now, show it right away
          updateTheDOMSomehow(htmlFragment);
          resolve();
        } else if (template) {
          // Otherwhise, show a template that will be replaced by the real data once it arrives
          updateTheDOMSomehow(template.innerHTML);
          hasShownTemplate = true;
        }
      });
    });
  };

  navigateEvent.intercept({ handler: handler });
}

function handleProductToHomeTransition(navigateEvent: NavigateEvent, toPath: string, fromPath: string) {
  const handler = async () => {
    const data = await getFragment(toPath);

    if (!document.createDocumentTransition) {
      updateTheDOMSomehow(data);
      return;
    }

    const transition = document.createDocumentTransition();
    let image: HTMLImageElement | null;
    let background: Element | null;

    transition
      .start(() => {
        updateTheDOMSomehow(data);

        const link = getLink(fromPath);
        image = link.querySelector('.product__img');
        background = link.querySelector('.product__bg');

        if (image && background) {
          image.classList.add('product-image');
          background.classList.add('product-bg');

          scrollIntoView(image, { behavior: 'smooth', scrollMode: 'if-needed' });
        }
      })
      .then(() => {
        if (image && background) {
          image.classList.remove('product-image');
          background.classList.remove('product-bg');
        }
      });
  };

  navigateEvent.intercept({ handler });
}

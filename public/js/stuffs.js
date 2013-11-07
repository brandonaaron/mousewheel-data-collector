(function() {

  var Collector = {
    setup: function() {
      this.$collector = $('.collector');
      this.$instruction = this.$collector.find('.instruction');
      this.$yourresults = $('.yourresults');
      this.$yourresultsmin = this.$yourresults.find('.yourresults-min');
      this.$yourresultsmax = this.$yourresults.find('.yourresults-max');
      this.$yourresultsres = this.$yourresults.find('.yourresults-res');
      this.$submit = $('.submit');
      this.$useragent = $('.useragent');
      this.data = {
        useragent: this.$useragent.data('ua'),
        delta: {
          normalized: {
            min: null,
            max: null
          },
          raw: {
            min: null,
            max: null
          },
          resolution: null
        }
      };
      this.$collector.on('mousewheel', $.proxy(this, 'collection'));
      this.$submit.on('click', '.btn', $.proxy(this, 'submitResults'));
    },

    submitResults: function(event) {
      this.disableSubmit();
      $.ajax({
        type: 'POST',
        data: this.data,
        complete: function() {
          console.log(arguments);
        }
      });
      console.log(event);
    },

    disableSubmit: function() {
      this.$submit.find('.btn').attr('disabled', true);
    },

    enableSubmit: function() {
      this.$submit.find('.btn').attr('disabled', false);
    },

    fadeIn: function() {
      if (this.animating === false) return;
      this.$instruction.fadeTo(500, 1, $.proxy(this, 'fadeOut'));
    },

    fadeOut: function() {
      if (this.animating === false) return;
      this.$instruction.stop().fadeTo(500, .40, $.proxy(this, 'fadeIn'));
    },

    startAnimating: function() {
      if (this.animatingTimeout) clearTimeout(this.animatingTimeout);
      this.animatingTimeout = setTimeout($.proxy(this, 'stopAnimating'), 1000);

      if (this.animating === true) return;
      this.animating = true;
      this.fadeOut();
      this.disableSubmit();
    },

    stopAnimating: function() {
      this.animating = false;
      this.$instruction.stop().fadeTo(500, 1);
      this.enableSubmit();
    },

    updateYourResults: function() {
      this.$yourresultsmin.html( this.data.delta.normalized.min + ', ' + this.data.delta.raw.min);
      this.$yourresultsmax.html( this.data.delta.normalized.max + ', ' + this.data.delta.raw.max);
      this.$yourresultsres.html( this.data.delta.resolution );
    },

    collection: function(event, delta, deltaX, deltaY, rawDelta, lowestDelta) {
      event.preventDefault();
      this.startAnimating();
      if (rawDelta === 0)
        console.log(delta, rawDelta, lowestDelta);
      var absDelta = Math.abs(delta),
          absRawDelta = Math.abs(rawDelta),
          min = this.data.delta.normalized.min === null ? absDelta : Math.min( absDelta, this.data.delta.normalized.min ),
          max = this.data.delta.normalized.max === null ? absDelta : Math.max( absDelta, this.data.delta.normalized.max ),
          rmin = this.data.delta.raw.min === null ? absRawDelta : Math.min( absRawDelta, this.data.delta.raw.min ),
          rmax = this.data.delta.raw.max === null ? absRawDelta : Math.max( absRawDelta, this.data.delta.raw.max );
      this.data.delta.normalized.min = min;
      this.data.delta.normalized.max = max;
      this.data.delta.raw.min = rmin;
      this.data.delta.raw.max = rmax;
      this.data.delta.resolution = lowestDelta;
      this.updateYourResults();
    }
  }

  $(function() {
    Collector.setup();
    window.Collector = Collector;
  });

})();
